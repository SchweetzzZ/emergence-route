import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import type { TelemetryDto } from "./schemas/zod-validation"
import { RealtimeService } from "../realtime/realtime.service"

@Injectable()
export class TelemetryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly realtimeService: RealtimeService
    ) { }

    async updateLocation(data: TelemetryDto) {
        const vehicule = await this.prisma.vehicule.update({
            where: {
                id: data.vehiculeId
            },
            data: {
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
}