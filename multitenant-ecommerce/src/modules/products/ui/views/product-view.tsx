'use client';

/// TODO: Add real ratings and reviews

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { formatCurrency, generateTenantURL } from "@/lib/utils";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { LinkIcon, StarIcon } from "lucide-react";
import { Fragment } from "react";
import { Progress } from "@/components/ui/progress";

interface ProductViewProps {
    productId: string;
    tenantSlug: string;
};

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.products.getOne.queryOptions({ id: productId }));
    return (
        <div className="px-4 lg:px-12 py-10">
            <div className="border rounded-sm bg-white overflow-hidden">
                <div className="relative aspect-[3.9] border-b">
                    <Image
                        alt={data.name}
                        fill
                        src={data.image?.url || "/placeholder.png"}
                        className="object-cover"
                    />
                </div>
                <div className="grid grid-col-1 lg:grid-col-6">
                    <div className="col-span-4">
                        <div className="p-6">
                            <div className="text-4xl font-medium">
                                {data.name}
                            </div>
                            <div className="border-y flex">
                                <div className="px-6 py-4 flex item-center justify-center border-r">
                                    <div className="relative px-2 py-1 border bg-pink-400 w-fit">
                                        <p className="text-base font-medium">{formatCurrency(data.price)}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 fex items-center justify-center lg:border-r">
                                    <Link href={generateTenantURL(tenantSlug)} className="flex items-center gap-2">
                                        {data.tenant.image?.url && (
                                            <Image
                                                alt={data.tenant.name}
                                                src={data.tenant.image.url}
                                                width={20}
                                                height={20}
                                                className="rounded-full border shrink-0 size-[20px]"
                                            />
                                        )}
                                        <p className="text-base underline font-medium">
                                            {data.tenant.name}
                                        </p>
                                    </Link>
                                </div>
                                <div className="hidden lg:flex px-6 py-4 items-center justify-center">
                                    <div className="flex items-center gap-1">
                                        <StarRating 
                                            rating={4}
                                            iconClassName="size-4"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
                                <div className="flex items-center gap-1">
                                    <StarRating 
                                        rating={4}
                                        iconClassName="size-4"
                                    />
                                    <p className="text-base font-medium">
                                        {5} ratings
                                    </p>
                                </div>
                            </div>
                            <div className="p-6">
                                {data.description ? (
                                    <p>{data.description}</p>
                                ): (
                                    <p className="font-medium text-muted-foreground italic">
                                        No description available for this product.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <div className="border-t lg:border-t-0 lg:border-l h-full">
                                <div className="flex flex-col gap-4 p-6 border-b">
                                    <div className="flex flex-row items-center gap-2">
                                        <Button
                                            variant="elevated"
                                            className="flex-1 bg-pink-400"
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            className="size-12"
                                            variant="elevated"
                                            onClick={() => {}}
                                            disabled={false}
                                        >
                                            <LinkIcon />
                                        </Button>
                                    </div>
                                    <p className="text-center font-medium">
                                        {data.refundPolicy === "No Refunds"
                                            ? "No refunds"
                                            : `${data.refundPolicy} money back guarantee`
                                              
                                        }
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="flex item-center justify-between">
                                        <h3 className="text-x font-medium">
                                            Ratings
                                        </h3>
                                        <div className="flex items-center gap-x-l font-medium">
                                            <StarIcon className="size-4 fill-black" />
                                            <p>({5})</p>
                                            <p className="text-base">{5} ratings</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                           <Fragment key={stars}>
                                            <div className="font-medium">{stars} {stars === 1 ? "star" : "star"}</div>
                                            <Progress
                                                value={25}
                                                className="h-[1lh]"
                                            />
                                            <div className="font-medium">
                                                {25}%
                                            </div>
                                           </Fragment> 
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};