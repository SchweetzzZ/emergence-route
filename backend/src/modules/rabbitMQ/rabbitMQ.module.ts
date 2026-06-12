import { Module } from "@nestjs/common";
import { RabbitMQService } from "./rabbitMQ.service";
import { RabbitMQConsumer } from "./rabbitMQ.consumer";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
    imports: [RealtimeModule],
    exports: [RabbitMQService],
    providers: [
        RabbitMQService,
        RabbitMQConsumer
    ]
})
export class RabbitMQModule { }