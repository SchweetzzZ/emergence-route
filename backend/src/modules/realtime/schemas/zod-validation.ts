import { z } from "zod"

export const realtimeSchema = z.object({
    vehiculeId: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number()
})


export type RealtimeDto = z.infer<typeof realtimeSchema>