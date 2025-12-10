import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
    slug: "orders",
    access: {
        create: ({ req }) => isSuperAdmin(req.user),
        update: ({ req }) => isSuperAdmin(req.user),
        delete: ({ req }) => isSuperAdmin(req.user),
        read: ({ req }) => isSuperAdmin(req.user),
    },
    admin: {
        useAsTitle: "name",
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false,
        },
        {
            name: "products",
            type: "relationship",
            required: true,
            relationTo: "products",
            hasMany: true,
        },
        {
            name: "stripeCheckoutSessionId",
            type: "text",
            required: true,
            admin: {
                description: "Stripe Checkout Session ID associated with the order"
            }
        },
    ],
};