import { Body, Controller, Post } from "@nestjs/common";
import { TrackingService } from "./tracking.service";
import { trackingSchema } from "./schemas/zod-validation";
import type { TrackingInput } from "./schemas/zod-validation";
import { ZodBody } from "../common/decorators/zod.decorator";

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post()
    async updateLocation(@ZodBody(trackingSchema) data: TrackingInput) {
        return this.trackingService.updateLocation(data)
    }
}
