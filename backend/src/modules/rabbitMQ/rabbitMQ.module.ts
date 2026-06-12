import { Module } from "@nestjs/common";
import { RabbitMQService } from "./rabbitMQ.service";
import { RabbitMQConsumer } from "./rabbitMQ.consumer";

@Module({
    exports: [RabbitMQService],
    providers: [
        RabbitMQService,
        RabbitMQConsumer
    ]
})
export class RabbitMQModule { }