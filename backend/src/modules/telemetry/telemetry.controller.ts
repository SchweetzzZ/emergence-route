import { Controller, Post } from "@nestjs/common";
import { TelemetryService } from "./telemetry.service";
import { ZodBody } from "../common/decorators/zod.decorator";
import { telemetrySchema } from "./schemas/zod-validation";
import type { TelemetryDto } from "./schemas/zod-validation";

@Controller("telemetry")
export class TelemetryController {
    constructor(private readonly telemetryService: TelemetryService) { }

    @Post()
    async updateLocation(@ZodBody(telemetrySchema) data: TelemetryDto) {
        return this.telemetryService.updateLocation(data);
    }
}
