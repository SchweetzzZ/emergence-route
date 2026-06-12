import { Injectable, OnModuleInit } from "@nestjs/common";
import * as amqp from "amqplib"

@Injectable()
export class RabbitMQService implements OnModuleInit {
    private channel: amqp.Channel

    async onModuleInit() {
        const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
        const maxRetries = 10;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const connection = await amqp.connect(rabbitmqUrl);
                this.channel = await connection.createChannel();

                await this.channel.assertQueue("dispatch_queue", {
                    durable: true,
                });
                console.log("rabbitMQ conectado");
                return;
            } catch (err) {
                console.log(`RabbitMQ tentativa ${attempt}/${maxRetries} falhou, tentando novamente em ${attempt * 2}s...`);
                if (attempt === maxRetries) throw err;
                await new Promise((r) => setTimeout(r, attempt * 2000));
            }
        }
    }

    getChannel() {
        return this.channel
    }

    async publishDispatch(payload: {
        assignmentId: string,
        incidentId: string,
        vehiculeId: string,
    }) {
        if (!this.channel) {
            throw new Error("RabbitMQ não conectado")
        }
        this.channel.sendToQueue("dispatch_queue", Buffer.from(JSON.stringify(payload)),
            {
                persistent: true
            })
    }
}