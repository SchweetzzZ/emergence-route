import { z } from "zod"

export const TrackingSchema = z.object({
    vehiculeId: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    speed: z.number().optional(),
})
export type TrackingInputDTO = z.infer<typeof TrackingSchema>