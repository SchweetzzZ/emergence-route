import {
    WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage, OnGatewayConnection,
    OnGatewayDisconnect, MessageBody, WsException,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io"
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
    cors: {
        origin: "*"
    },
    namespace: "realtime"
})

@WebSocketGateway()
export class RealtimeService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    constructor(private readonly jwtService: JwtService) { }

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization
            client.handshake.query?.token

            if (token) {
                const payload = this.jwtService.verify(token, { secret: process.env.jwtSecret })
                client.data.user = payload
                console.log(`Cliente autenticado conectado: ${payload.email} (Socket ID: ${client.id})`);
            } else {
                console.log(`Cliente anônimo conectado (Socket ID: ${client.id})`);
            }
        }
        catch (error) {
            throw new WsException("Falha na autenticação do Socket")
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`)
    }


    @SubscribeMessage("vehicule_join")
    handleVehiculeJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { vehiculeId: string }) {
        const room = `vehicule${payload.vehiculeId}`
        client.join(room)

        console.log(`Cliente ${client.id} entrou na sala ${room}`)

        return { event: "joined!", room }
    }

    @SubscribeMessage("vehicule_leave")
    handleVehiculeLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { vehiculeId: string }) {
        const room = `vehicule${payload.vehiculeId}`
        client.leave(room)

        console.log(`Cliente ${client.id} saiu da sala ${room}`)

        return { event: "left!", room }
    }

    @SubscribeMessage("incident_join")
    handleIncidentJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { incidentId: string }) {
        const room = `incident${payload.incidentId}`
        client.join(room)

        console.log(`Cliente ${client.id} entrou na sala ${room}`)

        return { event: "joined!", room }
    }

    @SubscribeMessage("incident_leave")
    handleIncidentLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { incidentId: string }) {
        const room = `incident${payload.incidentId}`
        client.leave(room)

        console.log(`Cliente ${client.id} saiu da sala ${room}`)

        return { event: "left!", room }
    }

    emitVehiculeLocationUpdate(vehiculeId: string, latitude: number, longitude: number) {
        this.server.to(`vehicle:${vehiculeId}`).emit(`vehicle.location.updated`,
            {
                vehiculeId,
                latitude,
                longitude
            }
        )
    }
}