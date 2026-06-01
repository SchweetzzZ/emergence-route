export const PERMISSIONS = {
    incident: {
        create: "incident:create",
        update: "incident:update",
        delete: "incident:delete",
        read: "incident:read",
    },
    vehicule: {
        create: "vehicule:create",
        update: "vehicule:update",
        delete: "vehicule:delete",
        read: "vehicule:read",
    }
} as const

export type Permission = {
    [K in keyof typeof PERMISSIONS]: typeof PERMISSIONS[K][keyof typeof PERMISSIONS[K]]
}[keyof typeof PERMISSIONS]