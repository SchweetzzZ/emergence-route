import { z } from "zod"

export const DispatchSchema = z.object({
    incidentId: z.string().uuid(),
    vehiculeId: z.string().uuid()
})

export type DispatchDto = z.infer<typeof DispatchSchema>

export const DispatchStatusSchema = z.object({
    status: z.enum(["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "COMPLETED", "CANCELLED"]),
    incidentId: z.string().uuid(),
    assignmentId: z.string().uuid(),
    vehiculeId: z.string().uuid()
})

export type DispatchStatusDto = z.infer<typeof DispatchStatusSchema>