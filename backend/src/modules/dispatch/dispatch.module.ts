import { Module } from "@nestjs/common";
import { DispatchService } from "./dispatch.service";
import { PrismaService } from "../prisma/prisma.service";
import { DispatchController } from "./dispatch.controller";
import { RabbitMQModule } from "../rabbitMQ/rabbitMQ.module";
import { VehiculesModule } from "../vehicules/vehicules.module";

@Module({
    imports: [RabbitMQModule, VehiculesModule],
    controllers: [DispatchController],
    providers: [DispatchService, PrismaService],
    exports: [DispatchService]
})
export class DispatchModule { }