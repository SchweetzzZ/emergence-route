import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
    private redis: Redis;

    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
        } else {
            const redisHost = process.env.REDIS_HOST || "localhost";
            const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
            this.redis = new Redis({
                host: redisHost,
                port: redisPort,
            });
        }
    }

    getClient() {
        return this.redis;
    }

    async getPendingAcidents() {
        const resultPending = await this.redis.zrevrange(
            "pendding_incidents",
            0,
            9,
        );
        return resultPending
    }
}