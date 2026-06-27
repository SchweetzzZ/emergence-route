import { Controller, Post, Body, Put, Param, Delete, Get, UseGuards } from "@nestjs/common"
import { VehiculesService } from "./vehicules.service"
import type { CreateVehiculeDto, UpdateVehiculeDto } from "./schema/vehicule-zod"
import { createVehiculeSchema, updateVehiculeSchema } from "./schema/vehicule-zod"
import { ZodBody } from "../common/decorators/zod.decorator"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { PermissionGuard } from "../common/guards/permissions.guard"
import { Permissions } from "../common/decorators/permission.decorator"
import { PERMISSIONS } from "../common/enums/permissions.enum"
import { RoleGuard } from "../common/guards/role.guard"

@Controller("vehicules")
export class VehiculesController {
    constructor(private readonly vehiculeService: VehiculesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard,)
    async createVehicule(@ZodBody(createVehiculeSchema) data: CreateVehiculeDto) {
        return this.vehiculeService.createVehicule(data)
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async updateVehicule(@ZodBody(updateVehiculeSchema) data: UpdateVehiculeDto, @Param("id") id: string) {
        return this.vehiculeService.updateVehicule(id, data)
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async deleteVehicule(@Param("id") id: string) {
        return this.vehiculeService.deleteVehicule(id)
    }

    @Get()
    async listVehicules() {
        return this.vehiculeService.listVehicules()
    }

    @Get(":id")
    async getVehiculeById(@Param("id") id: string) {
        const result = await this.vehiculeService.getVehiculeById(id)
        if (!result) {
            return { message: "Vehicule not found" }
        }
        return result
    }

    @Get("nearest/:incidentId")
    async findNearestVehicule(@Param("incidentId") incidentId: string) {
        return this.vehiculeService.findNearestVehicule(incidentId)
    }

    @Get("online")
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async getOnlineVehicules() {
        return this.vehiculeService.getOnlineVehicules()
    }
}