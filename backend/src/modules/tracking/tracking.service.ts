import { Injectable } from "@nestjs/common";
import { PrismaService } from "./../prisma/prisma.service";
import { KafkaService } from "../kafka/kafka.service";
import { TrackingInputDTO } from "./schemas/zod-validation";

@Injectable()
export class TrackingService {
    constructor(private readonly prisma: PrismaService,
        private kafkaService: KafkaService
    ) { }

    async handleLocation(data: TrackingInputDTO) {
        const result = await this.kafkaService.publishLocation(data)
        return result
    }

    async getHistory(vehiculeId: string) {
        const result = await this.prisma.vehicule.findMany({
            where: {
                id: vehiculeId
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return result
    }

    async getCurrentLocation(vehiculeId: string) {
        const result = await this.prisma.vehicule.findUnique({
            where: {
                id: vehiculeId
            },
            select: {
                id: true,
                latitude: true,
                longitude: true,
                lastSeen: true,
                trackingEnable: true
            }
        })
        return result
    }

    async getTelemetryHistory(vehiculeId: string, hours: number = 2) {
        const fromDate = new Date(Date.now() - hours * 60 * 60 * 1000)

        return this.prisma.telemetry.findMany({
            where: {
                vehiculeId,
                createdAt: {
                    gte: fromDate
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    }
    async getStats(vehiculeId: string) {
        const telemetry = await this.prisma.telemetry.findMany({
            where: {
                vehiculeId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (telemetry.length === 0) {
            return {
                totalLocations: 0,
                firstSignal: null,
                lastSignal: null,
                averageSpeed: 0,
            };
        }

        const speeds = telemetry
            .filter(t => t.speed !== null)
            .map(t => t.speed as number);

        const averageSpeed =
            speeds.length > 0
                ? speeds.reduce((a, b) => a + b, 0) / speeds.length
                : 0;

        return {
            totalLocations: telemetry.length,
            firstSignal: telemetry[0].createdAt,
            lastSignal: telemetry[telemetry.length - 1].createdAt,
            averageSpeed,
        };
    }
}