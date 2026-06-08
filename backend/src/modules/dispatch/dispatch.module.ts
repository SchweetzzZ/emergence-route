import { Module } from "@nestjs/common";
import { DispatchService } from "./dispatch.service";
import { PrismaService } from "../prisma/prisma.service";
import { DispatchController } from "./dispatch.controller";

@Module({
    controllers: [DispatchController],
    providers: [DispatchService, PrismaService],
    exports: [DispatchService]
})
export class DispatchModule { }