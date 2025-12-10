import { isSuperAdmin } from "@/lib/access";
import { Tenant } from "@/payload-types";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: "products",
    access: {
        create: ({ req }) => {
            if (isSuperAdmin(req.user))
                return true;
            const tenant = req.user?.tenants?.[0]?.tenant as Tenant;

            return Boolean(tenant?.stripeDetailsSubmitted);
        }
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
            // TODO 
            name: "description",
            type: "text",
        },
        {
            name: "price",
            type: "number",
            required: true,
            admin: {
                description: "Price in USD",
            }
        },
        {
            name: "category",
            type: "relationship",
            relationTo: "categories",
            hasMany: false,
        },
        {
            name: "tags",
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "cover",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "refundPolicy",
            type: "select",
            options: ["30-day", "14-day", "7-day", "3-day", "1-day", "No Refunds"],
            defaultValue: "30-day",        
        },
        {
            name: "content",
            // TODO: Change to RichText
            type: "textarea",
            admin: {
                description:
                "Protected content only visible to customers after purchase. Add product documentation, downloadable foles, getting started guides, and bonus materials. Supports Markdown formatting"
            }

        }                                                                
    ]
}