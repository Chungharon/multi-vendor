import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Where } from "payload";                                                                           
import z from "zod";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure

    .input(z.object({
        category: z.string().nullable().optional(),
    }),

    )
    .query(async ({ ctx, input }) => {
        const where: Where = {};
        if (input.category) {
            // Optionally, fetch category data if needed
            const categoryData = await ctx.db.find({
                collection: "categories",
                limit: 1,
                depth: 1,
                pagination: false,
                where: {
                    slug: {
                        equals: input.category,
                    }
                }
            });

            console.log(JSON.stringify(categoryData, null, 2))


            const formattedData = categoryData.docs.map((doc) => ({
                ...doc,
                subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
                    ...(doc as Category),
                    subcategories: undefined,
                }))
            }))

            const subcategoriesSlugs = [];

            const parentCategory = formattedData[0];

            if (parentCategory) {
                subcategoriesSlugs.push(
                    ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
                )
            }

             if (parentCategory) {
                where["category.slug"] = {
                    in: [parentCategory.slug, ...subcategoriesSlugs]
                }
            }
        }
        
        const data = await ctx.db.find({
            collection: "products",
            depth: 1, // Populate the "category" "image" 
            where,
        });

        // Artificial delay for development/testing

        return data
    }),
});