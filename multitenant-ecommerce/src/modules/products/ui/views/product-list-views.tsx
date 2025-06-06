import { Suspense } from "react"
import { ProductsList, ProductsListSkeleton } from "../components/product-list"
import { ProductFilters } from "../components/product-filters"
import { ProductSort } from "../components/product-sort"

interface Props {
    category?: string;
};

export const ProductListView = ({ category }: Props) => {
    return (
        <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
                <p className="text-2xl font-medium">Curated for you</p>
                    <ProductSort />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
                <div className="lg:col-span-2 xl:col-span-2">
                    <ProductFilters />
                </div>
                <div className="lg:col-span-4 xl:col-span-6">
                    <Suspense fallback={<ProductsListSkeleton />}>
                        <ProductsList category={category} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}