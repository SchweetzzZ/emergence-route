import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) {}

    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { api: "ok", postgres: "ok" };
        } catch {
            return { api: "ok", postgres: "down" };
        }
    }
}
