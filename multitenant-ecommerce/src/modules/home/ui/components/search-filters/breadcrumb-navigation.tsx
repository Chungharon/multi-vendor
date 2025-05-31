import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Props {
  activeCategoryName?: string | null;
  activeSubcategoryName?: string | null;
  activeCategory?: string | null;
}

export const BreadCrumbNavigation = ({
  activeCategoryName,
  activeCategory,
  activeSubcategoryName,
}: Props) => {
  // Dev warning for debugging
  if ((!activeCategoryName || activeCategory === "all") && process.env.NODE_ENV === 'development') {
    console.warn('Breadcrumb not rendered:', { activeCategoryName, activeCategory, activeSubcategoryName });
  }

  // If no active category or "all", show fallback breadcrumb for "All"
  if (!activeCategoryName || activeCategory === "all") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xl font-medium">All</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {activeSubcategoryName ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-xl font-medium underline text-primary">
                <Link href={`/${activeCategory}`}>
                  {activeCategoryName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-primary font-medium text-lg">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xl font-medium">
                {activeSubcategoryName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xl font-medium">
              {activeCategoryName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
