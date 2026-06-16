import { Module } from "@nestjs/common";
import { TrackingController } from "./tracking.controller";
import { TrackingService } from "./tracking.service";
import { KafkaModule } from "../kafka/kafka.module";
import { PrismaService } from "../prisma/prisma.service";
import { TrackingScheduler } from "./tracking.scheduler";

@Module({
    imports: [KafkaModule],
    controllers: [TrackingController],
    providers: [TrackingService, PrismaService, TrackingScheduler]
})

export class TrackingModule { }