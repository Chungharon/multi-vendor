import { ProductsList, ProductsListSkeleton } from "@/modules/products/ui/components/product-list";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

interface Props {
    params: Promise<{
        subcategory: string;
    }>
}

const Page = async ({ params }: Props) => {
    const { subcategory } = await params;
    

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({
        category: subcategory,
    }))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ProductsListSkeleton />}>
                <ProductsList category={subcategory} />
            </Suspense>
            
        </HydrationBoundary>
    )
};

export default Page;