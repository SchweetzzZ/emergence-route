# EmergenceRoute — Emergency Dispatch & Vehicle Tracking API

A NestJS backend for real-time emergency dispatch management and vehicle location tracking, built with a microservices-oriented architecture using Kafka, RabbitMQ, Redis, and WebSockets.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Module: Auth](#module-auth)
- [Module: Vehicles](#module-vehicles)
- [Module: Incidents](#module-incidents)
- [Module: Dispatch (Core)](#module-dispatch-core)
- [Module: Tracking](#module-tracking)
- [WebSocket Gateway (Realtime)](#websocket-gateway-realtime)
- [Roles & Permissions](#roles--permissions)
- [Data Models](#data-models)

---

## Architecture Overview

The project is divided into two distinct responsibilities:

### 🚨 Emergency Dispatch Module (Core)
The heart of the system. Manages the full lifecycle of an emergency event — from incident registration to vehicle dispatch, route progression, and resolution. Every state transition emits an audit event to Kafka and notifies the vehicle in real time via WebSocket.

### 🗺️ Tracking Module (Personal)
A standalone module designed for personal or family vehicle monitoring. Can be used independently of the dispatch system — for example, to track a family car in real time. Provides two integration options:

- **Option 1 — HTTP POST:** Sends a location update via REST API. Suitable for periodic polling or server-to-server integrations.
- **Option 2 — WebSocket (Experimental, Priority):** Uses the `tracking_localization` WebSocket event as the primary provider. The client connects via Socket.IO, sends location directly through the persistent connection, and Kafka handles the rest. This is the preferred approach for real-time, low-latency use cases.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Async Messaging | Kafka (KRaft mode, no Zookeeper) |
| Queue | RabbitMQ |
| Real-time | WebSocket (Socket.IO) |
| Validation | Zod |
| Auth | JWT (HttpOnly Cookie) |

---

## Getting Started

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repository
git clone <repo-url>
cd emergence-route/backend

# 2. Set up the environment file
cp .env.example .env
# Edit .env with your secrets (see Environment Variables section)

# 3. Start all infrastructure and the API
docker-compose up --build

# 4. Run database migrations (first time only)
docker exec -it emergency_api npx prisma migrate deploy
```

The API will be available at `http://localhost:3000`.

---

## Environment Variables

```env
DATABASE_URL=postgres://postgres:password@localhost:5434/emergencyDB
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
KAFKA_BROKER=localhost:9092
JWT_SECRET=your_jwt_secret
PORT=3000
```

---

## Module: Auth

Handles user registration and login. The JWT token is set as an HttpOnly cookie on login and also returned in the response body.

### `POST /auth/register`

Creates a new user account. Default role is `USER`.

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "11999990000"
}
```

---

### `POST /auth/login`

Authenticates the user and returns a JWT token. The token is also stored as an HttpOnly cookie (`access_token`).

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc..."
}
```

> All subsequent protected requests must include this token as a cookie or via `Authorization: Bearer <token>` header.

---

## Module: Vehicles

CRUD for emergency vehicles (ambulances, fire trucks, police cars, tow trucks). Protected endpoints require `ADMIN` role.

### `POST /vehicules` 🔒

Registers a new vehicle.

```json
{
  "name": "Ambulância 01",
  "plate": "ABC-1234",
  "type": "AMBULANCE",
  "status": "AVAILABLE",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

**Vehicle types:** `AMBULANCE` | `FIRE_TRUCK` | `POLICE_CAR` | `TOW_TRUCK`

**Vehicle statuses:** `AVAILABLE` | `DISPATCHED` | `BUSY` | `OFFLINE` | `EN_ROUTE` | `AT_INCIDENT`

---

### `PUT /vehicules/:id` 🔒

Updates any field of a vehicle. All fields are optional.

```json
{
  "status": "AVAILABLE",
  "latitude": -23.5600,
  "longitude": -46.6400
}
```

---

### `DELETE /vehicules/:id` 🔒

Deletes a vehicle by ID.

---

### `GET /vehicules`

Lists all registered vehicles.

---

### `GET /vehicules/:id`

Returns a single vehicle by ID.

---

### `GET /vehicules/nearest/:incidentId`

Finds available vehicles nearest to a given incident location, ordered by distance. Used internally by the auto-dispatch feature.

---

### `GET /vehicules/online` 🔒

Returns all vehicles with `trackingEnable: true` (currently sending location signals).

---

## Module: Incidents

Manages emergency incidents. Protected write operations require `ADMIN` role.

### `POST /incidents` 🔒

Creates a new incident.

```json
{
  "type": "MEDICAL",
  "location": "Av. Paulista, 1000 - São Paulo",
  "description": "Pessoa inconsciente na calçada",
  "status": "PENDING",
  "latitude": -23.5613,
  "longitude": -46.6559,
  "priority": 90
}
```

**Incident types:** `ACCIDENT` | `FIRE` | `MEDICAL`

**Incident statuses:** `PENDING` | `IN_PROGRESS` | `RESOLVED`

**`priority`** is optional (default: 50). Range: 0–100, where 100 is highest priority.

---

### `PUT /incidents/:id` 🔒

Partially updates an incident. All fields are optional.

```json
{
  "status": "IN_PROGRESS",
  "description": "Paciente consciente, aguardando resgate"
}
```

---

### `DELETE /incidents/:id` 🔒

Deletes an incident by ID.

---

### `GET /incidents`

Lists all incidents.

---

### `GET /incidents/priority`

Returns incidents ordered by highest priority first.

---

### `GET /incidents/:id`

Returns a single incident by ID.

---

## Module: Dispatch (Core)

The core of the system. Manages the full lifecycle of an emergency dispatch. Every status transition is atomically persisted in a database transaction and audited via a Kafka event.

### Dispatch Lifecycle

```
ASSIGNED → ACCEPTED → EN_ROUTE → ARRIVED → COMPLETED
```

Each step has its own endpoint and strict validation — a step can only be called if the assignment is in the correct preceding status.

---

### `POST /dispatch` 🔒

Manually creates a dispatch, linking a specific incident to a specific vehicle.

```json
{
  "incidentId": "uuid-of-incident",
  "vehiculeId": "uuid-of-vehicle"
}
```

> The incident must be `PENDING` and the vehicle must be `AVAILABLE`. On success, the incident becomes `IN_PROGRESS` and the vehicle becomes `DISPATCHED`.

---

### `POST /dispatch/auto` 🔒

Automatically finds the nearest available vehicle to an incident and dispatches it.

```json
{
  "incidentId": "uuid-of-incident"
}
```

---

### `POST /dispatch/accept` 🔒

The vehicle crew accepts the dispatch assignment.

```json
{
  "assignmentId": "uuid-of-assignment",
  "incidentId": "uuid-of-incident",
  "vehiculeId": "uuid-of-vehicle",
  "status": "ACCEPTED"
}
```

> Assignment must be in `ASSIGNED` status. Vehicle becomes `EN_ROUTE`.

---

### `POST /dispatch/start-route` 🔒

Marks the vehicle as actively moving to the scene.

```json
{
  "assignmentId": "uuid-of-assignment",
  "incidentId": "uuid-of-incident",
  "vehiculeId": "uuid-of-vehicle",
  "status": "EN_ROUTE"
}
```

> Assignment must be in `ACCEPTED` status.

---

### `POST /dispatch/arrived` 🔒

Marks the vehicle as arrived at the incident location.

```json
{
  "assignmentId": "uuid-of-assignment",
  "incidentId": "uuid-of-incident",
  "vehiculeId": "uuid-of-vehicle",
  "status": "ARRIVED"
}
```

> Assignment must be in `EN_ROUTE` status. Vehicle becomes `AT_INCIDENT`.

---

### `POST /dispatch/completed` 🔒

Marks the dispatch as completed. If all assignments for the incident are resolved, the incident is automatically marked as `RESOLVED` and the vehicle returns to `AVAILABLE`.

```json
{
  "assignmentId": "uuid-of-assignment",
  "incidentId": "uuid-of-incident",
  "vehiculeId": "uuid-of-vehicle",
  "status": "COMPLETED"
}
```

> Assignment must be in `ARRIVED` status.

---

### `GET /dispatch`

Lists all dispatch assignments, ordered by most recent.

---

### `GET /dispatch/:id`

Returns a single assignment with full incident and vehicle details.

---

## Module: Tracking

Personal vehicle monitoring module. Can be used independently of the emergency dispatch flow. Ideal for tracking a family car or any vehicle you want to monitor in real time.

There are **two ways to send location data** — choose based on your use case:

---

### Option 1 — HTTP (Standard)

#### `POST /tracking` 🔒

Sends a location update via REST. The data is published to Kafka, which persists it to the `Telemetry` table and updates the vehicle's last known position.

```json
{
  "vehiculeId": "uuid-of-vehicle",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 13.8,
  "accuracy": 5.0,
  "heading": 270.0
}
```

- `speed`: in m/s (from the Browser Geolocation API). Optional, can be `null`.
- `accuracy`: GPS precision in meters. Optional.
- `heading`: direction in degrees (0–360), `null` if stationary. Optional.

---

### Option 2 — WebSocket (Experimental, Priority)

For real-time, low-latency tracking, connect via Socket.IO and emit the `tracking_localization` event. This is the **priority approach** — the WebSocket connection acts as the primary location provider, bypassing the HTTP layer entirely.

**Connection:**
```
ws://localhost:3000  (namespace: /realtime)
Auth: { token: "Bearer <jwt>" }
```

**Emit event: `tracking_localization`**
```json
{
  "vehiculeId": "uuid-of-vehicle",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "speed": 13.8,
  "accuracy": 5.0,
  "heading": 270.0
}
```

**Response:**
```json
{ "success": true }
```

> The server publishes the payload directly to Kafka, which handles persistence and real-time propagation. This method is ideal for continuous GPS streaming from a mobile device or browser.

---

### `GET /tracking/current/:vehiculeId`

Returns the vehicle's current last-known position and whether tracking is active.

---

### `GET /tracking/history/:vehiculeId`

Returns the full telemetry history for a vehicle, ordered chronologically.

---

### `GET /tracking/telemetry/:vehiculeId?hours=2`

Returns telemetry records from the last N hours (default: 2).

**Query param:** `hours` (optional, integer)

Example: `GET /tracking/telemetry/uuid-of-vehicle?hours=6`

---

### `GET /tracking/stats/:vehiculeId`

Returns aggregated stats computed from the telemetry history:

```json
{
  "totalLocations": 142,
  "firstSignal": "2026-06-27T10:00:00.000Z",
  "lastSignal": "2026-06-27T11:00:00.000Z",
  "averageSpeedKmh": 42.3,
  "maxSpeedKmh": 87.1
}
```

> Speed values from the Geolocation API (m/s) are automatically converted to km/h.

---

### Automatic Tracking Deactivation (Scheduler)

A background job runs every 60 seconds. If a vehicle has not sent a location signal in the last 5 minutes, its `trackingEnable` flag is set to `false` and a `TRACKING_SIGNAL_LOST` audit event is published to Kafka.

---

## WebSocket Gateway (Realtime)

The WebSocket gateway operates on the `/realtime` namespace using Socket.IO. All connections require a valid JWT.

**Connection:**
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/realtime", {
  auth: { token: "your-jwt-token" }
});
```

### Events (Client → Server)

| Event | Payload | Description |
|---|---|---|
| `vehicule_join` | `{ vehiculeId: string }` | Subscribe to location updates for a vehicle |
| `vehicule_leave` | `{ vehiculeId: string }` | Unsubscribe from a vehicle's room |
| `incident_join` | `{ incidentId: string }` | Subscribe to events for an incident |
| `incident_leave` | `{ incidentId: string }` | Unsubscribe from an incident's room |
| `tracking_localization` | See [Tracking - Option 2](#option-2--websocket-experimental-priority) | Send a live location update via socket |

### Events (Server → Client)

| Event | Room | Description |
|---|---|---|
| `vehicule.location.updated` | `vehicule:<id>` | Emitted when a vehicle's position is updated |
| `dispatch_assigned` | `vehicule:<id>` | Emitted when a new dispatch is assigned to a vehicle |
| `requires_auth` | — | Emitted if the connection has no valid JWT (client is disconnected immediately) |

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| `ADMIN` | Full access: create, read, update, delete on incidents and vehicles |
| `USER` | Read-only: `incident:read`, `vehicule:read` |

Roles are embedded in the JWT payload at login and validated on every protected request via `JwtAuthGuard` + `RoleGuard` + `PermissionGuard`.

---

## Data Models

### Recommended Testing Order

1. `POST /auth/register` — create an admin user
2. `POST /auth/login` — get a JWT token
3. `POST /vehicules` — register a vehicle with a known location
4. `POST /incidents` — register an incident near the vehicle
5. `POST /dispatch/auto` — auto-dispatch the nearest vehicle
6. `POST /dispatch/accept` — vehicle crew accepts
7. `POST /dispatch/start-route` — vehicle starts moving
8. `POST /dispatch/arrived` — vehicle arrives at scene
9. `POST /dispatch/completed` — incident resolved
10. `POST /tracking` or WebSocket `tracking_localization` — send location updates
11. `GET /tracking/stats/:vehiculeId` — view tracking statistics

### Audit Log

Every dispatch state change and tracking signal loss is automatically recorded in the `Auditlog` table via a Kafka consumer:

| Event Type | Trigger |
|---|---|
| `DISPATCH_ASSIGNED` | New dispatch created |
| `DISPATCH_ACCEPTED` | Vehicle crew accepts |
| `EN_ROUTE` | Vehicle starts route |
| `ARRIVED_AT_SCENE` | Vehicle arrives |
| `DISPATCH_COMPLETED` | Dispatch completed |
| `TRACKING_SIGNAL_LOST` | Vehicle goes offline (scheduler) |
