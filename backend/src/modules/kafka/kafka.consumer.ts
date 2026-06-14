import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Consumer } from "kafkajs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private consumer: Consumer;

    constructor(private readonly prisma: PrismaService) {
        this.kafka = new Kafka({
            clientId: 'emergence-route-api-consumer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
        });
        this.consumer = this.kafka.consumer({ groupId: 'audit-group' });
    }

    async onModuleInit() {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: 'audit-events', fromBeginning: true });

            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    if (!message.value) return;
                    const content = JSON.parse(message.value.toString());
                    
                    await this.prisma.auditlog.create({
                        data: {
                            eventType: content.eventType,
                            payload: content.payload
                        }
                    });
                    
                    console.log(`[Kafka Consumer] Log de Auditoria gravado: ${content.eventType}`);
                },
            });
            console.log("Kafka Consumer conectado e escutando 'audit-events'.");
        } catch (error: any) {
            console.error("Aviso: Erro ao conectar Kafka Consumer.", error.message);
        }
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}
