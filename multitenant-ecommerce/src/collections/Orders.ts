import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
    slug: "orders",
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
        },
    ],
};