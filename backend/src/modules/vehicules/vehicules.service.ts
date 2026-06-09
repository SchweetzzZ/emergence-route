import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehiculeDto, FindVehiculesDto, FindIncidentDto, UpdateVehiculeDto } from "./schema/vehicule-zod";
import { DistanceUtils } from "../utils/calculate-distance";

@Injectable()
export class VehiculesService {
    constructor(private prisma: PrismaService) { }

    async createVehicule(data: CreateVehiculeDto) {
        const createdVehicule = await this.prisma.vehicule.create({
            data
        })
        return createdVehicule
    }

    async updateVehicule(id: string, data: UpdateVehiculeDto) {
        const updatedVehicule = await this.prisma.vehicule.update({
            where: {
                id
            },
            data
        })
        return updatedVehicule
    }

    async deleteVehicule(id: string) {
        const deletedVehicule = await this.prisma.vehicule.delete({
            where: {
                id
            }
        })
        return deletedVehicule
    }

    async listVehicules() {
        const vehicules = await this.prisma.vehicule.findMany()
        return vehicules
    }

    async getVehiculeById(id: string) {
        const vehicule = await this.prisma.vehicule.findUnique({
            where: {
                id
            }
        })
        return vehicule
    }
    async findVehicule(incidentId: string) {
        const incidentVerify = await this.prisma.incident.findUnique({
            where: {
                id: incidentId
            }
        })
        if (!incidentVerify) {
            throw new Error("Incidente não encontrado")
        }
        const statusVehicule = await this.prisma.vehicule.findMany({
            where: {
                status: "AVAILABLE"
            }
        })

        const vehiculeWithDistance = statusVehicule.map((vehicule) => {
            const distance = DistanceUtils.haversine(
                incidentVerify.latitude,
                incidentVerify.longitude,
                vehicule.latitude,
                vehicule.longitude,
            )
            return {
                ...vehicule,
                distance
            }
        })

        return vehiculeWithDistance
    }
}