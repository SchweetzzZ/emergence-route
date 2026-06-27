import { Controller, Post, Put, Delete, Get, Body, Param, UseGuards } from "@nestjs/common";
import type { CreateIncidentDto, UpdateIncidentDto } from "./schemas/incident-zod";
import { IncidentsService } from "./incidents.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../common/guards/permissions.guard";
import { RoleGuard } from "../common/guards/role.guard";

@Controller("incidents")
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async createIncident(@Body() data: CreateIncidentDto) {
        return this.incidentsService.createIncident(data);
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async updatedIncident(@Body() data: UpdateIncidentDto, @Param("id") id: string) {
        return this.incidentsService.updatedIncident(data, id);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, PermissionGuard, RoleGuard)
    async deleteIncident(@Param("id") id: string) {
        return this.incidentsService.deleteIncident(id);
    }

    @Get()
    async getAllIncident() {
        return this.incidentsService.getAllIncident();
    }

    @Get("priority")
    async getPriorityIncidents() {
        return this.incidentsService.getPriorityIncidents();
    }

    @Get(":id")
    async getIncidentById(@Param("id") id: string) {
        return this.incidentsService.getIncidentById(id);
    }

}