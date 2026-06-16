import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer, logLevel } from "kafkajs";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";
import { TrackingInputDTO } from "../tracking/schemas/zod-validation";

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
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            logLevel: logLevel.WARN,
            retry: {
                initialRetryTime: 300,
                retries: 10,
                factor: 2,
                maxRetryTime: 30000,
            },
            requestTimeout: 30000,
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

    async publishLocation(data: TrackingInputDTO) {
        try {
            await this.producer.send({
                topic: "location-updates",
                messages: [{
                    value: JSON.stringify(data)
                }]
            })
            console.log(`[kafka producer] location update ${data.vehiculeId}`)
        } catch (error: any) {
            console.log("erro ao publicar localização", error.message)
        }
    }
}