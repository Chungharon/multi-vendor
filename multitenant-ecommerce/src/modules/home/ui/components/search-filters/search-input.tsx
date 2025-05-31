"use client"

import { Input } from "@/components/ui/input";
import { BookmarkCheckIcon, ListFilterIcon, SearchIcon } from "lucide-react";
import { CategoriesSiderbar } from "./categories-sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface Props {
    disable?: boolean;
};

export const SearchInput = ({
    disable,
}: Props) => {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);

    const trpc = useTRPC();
    const session = useQuery(trpc.auth.session.queryOptions())

    return (
        <div className="flex items-center gap-2 w-full">
            <CategoriesSiderbar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
            <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                <Input className="pl-8" placeholder="Search products" disabled={disable}/>
            </div>
            {/* TODO: Add categories view all button */}
            <Button
                variant="default"
                className="size-12 shrink-0 flex lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
            >
                <ListFilterIcon />
            </Button>
            {session.data?.user && (
                <Button
                     asChild
                     variant="default"
                >
                    <Link href="/library">
                      <BookmarkCheckIcon/>
                      Library
                    </Link>
                </Button>
            )}
            {/* TODO: Add library button */}
        </div>
    )
}