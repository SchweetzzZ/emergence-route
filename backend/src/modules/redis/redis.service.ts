import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
    constructor(private readonly prisma: PrismaService,
        private redis: Redis
    ) { }

    async
}