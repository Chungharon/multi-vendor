"use client";

import { useTRPC } from "@/trpc/client";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation"; // 
import { DEFAULT_BG_COLOR } from "../../../constants";
import { BreadCrumbNavigation } from "./breadcrumb-navigation";
import { useEffect } from "react";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const pathname = usePathname(); // 
  const params = useParams();

  const { data, refetch } = useSuspenseQuery(trpc.Categories.getMany.queryOptions());

  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";

  const activeCategoryData = data.find((category) => category.slug === activeCategory);
  const activeCategoryColor = activeCategoryData?.color || DEFAULT_BG_COLOR;
  const activeCategoryName = activeCategoryData?.name || null;

  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName =
    activeCategoryData?.subcategories?.find(
      (subcategory) => subcategory.slug === activeSubcategory
    )?.name || null;

  // 
  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: activeCategoryColor }}
    >
      <SearchInput />
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
      <BreadCrumbNavigation
        activeCategoryName={activeCategoryName}
        activeCategory={activeCategory}
        activeSubcategoryName={activeSubcategoryName}
      />
    </div>
  );
};

export const SearchFiltersLoading = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <SearchInput disable />
      <div className="hidden lg:block">
        <div className="h-11" />
      </div>
    </div>
  );
};