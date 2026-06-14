import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";
import { TelemetryDto } from "../telemetry/schemas/zod-validation";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private producer: Producer;

    constructor(
        private readonly prisma: PrismaService,
        private readonly realtimeService: RealtimeService
    ) {
        this.kafka = new Kafka({
            clientId: 'emergence-route-api',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
        });
        this.producer = this.kafka.producer();
    }

    async onModuleInit() {
        try {
            await this.producer.connect();
            console.log("Kafka Producer conectado com sucesso.");
        } catch (error: any) {
            console.error("Aviso: Erro ao conectar Kafka Producer. Iniciando API sem Kafka.", error.message);
        }
    }

    async onModuleDestroy() {
        await this.producer.disconnect();
    }

    async handleLocation(data: TelemetryDto) {
        const vehicule = await this.prisma.vehicule.update({
            where: {
                id: data.vehiculeId
            },
            data: {
                latitude: data.latitude,
                longitude: data.longitude
            }
        })

        await this.prisma.telemetry.create({
            data: {
                vehiculeId: vehicule.id,
                latitude: data.latitude,
                longitude: data.longitude
            }
        })

        this.realtimeService.emitVehiculeLocationUpdate(
            vehicule.id,
            vehicule.latitude,
            vehicule.longitude
        )
        return vehicule
    }

    async publishAuditEvent(eventType: string, payload: any) {
        const message = JSON.stringify({ eventType, payload });
        try {
            await this.producer.send({
                topic: 'audit-events',
                messages: [{ value: message }]
            });
            console.log(`[Kafka Producer] Evento publicado no tópico 'audit-events': ${eventType}`);
        } catch (error: any) {
            console.error(`Aviso: Falha ao publicar evento no Kafka (${eventType})`, error.message);
        }
    }
}