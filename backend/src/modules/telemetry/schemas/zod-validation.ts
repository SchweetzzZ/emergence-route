import { z } from "zod"

export const telemetrySchema = z.object({
    vehiculeId: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number()
})

export type TelemetryDto = z.infer<typeof telemetrySchema>