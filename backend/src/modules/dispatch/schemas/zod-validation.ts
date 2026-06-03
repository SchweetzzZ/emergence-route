import { z } from "zod"

export const assignVehiculeSchema = z.object({
    incidentId: z.string().uuid(),
    vehiculeId: z.string().uuid()
})

export type AssignVehiculeDto = z.infer<typeof assignVehiculeSchema>

export const updateAssignmentStatusSchema = z.object({
    status: z.enum(["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "COMPLETED", "CANCELLED"]),

    assignmentId: z.string().uuid(),
    vehiculeId: z.string().uuid()
})

export type UpdateAssignmentStatusDto = z.infer<typeof updateAssignmentStatusSchema>