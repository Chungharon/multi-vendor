"use client"

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCart } from "../../hooks/use-cart";
import { useEffect } from "react";
import { toast } from "sonner";
import { generateTenantURL } from "@/lib/utils";
import { CheckoutItem } from "../components/checkout-items";
import { CheckoutSiderbar } from "../components/checkout-sidebar";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { useRouter } from "next/navigation";

interface CheckoutViewProps {
    tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {

    const router = useRouter();
    const [states, setStates] = useCheckoutStates();
    const { productIds, removeProduct, clearCart } = useCart(tenantSlug);
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data, error, isLoading } = useQuery(trpc.checkout.getProducts.queryOptions({
        ids: productIds,
    }));

    const purchase = useMutation(trpc.checkout.purchase.mutationOptions({
        onMutate: () => {
            setStates({ success: false, cancel: false });
        },
        onSuccess: (data) => {
            window.location.href = data.url; // Redirect to Stripe Checkout
        },
        onError: (error) => {
            if (error?.data?.code === "NOT_FOUND") {
                // TODO: Modify when subdomains are supported
                router.push("/sign-in");
            }
            toast.error(error.message);
        },
    }));

    useEffect(() => {
        if (error?.data?.code === "NOT_FOUND") {
            clearCart();
            toast.warning("Invalid products found, cart cleared")
        }
    }, [error, clearCart]);

    useEffect(() => {
        if (states.success) {
            // http://localhost:3000/tenants/john/checkout?success=true
            setStates({ success: false, cancel: false });
            clearCart(); 
            queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
            /// TODO: Invalidate library
            router.push("/library"); // Redirect to products page after successful purchase
        }
    }, [states.success, clearCart, router, setStates, queryClient, trpc.library.getMany,]);

    if (isLoading) {
        return (
            <div className="lg:pt-16 pt-4 lg:px-12">
                <div className="border border-black border-dashed flex items-center justify-center p-8
                    flex-col gap-y-4 bg-white w-full rounded-lg">
                        <LoaderIcon className="text-muted-foreground animate-spin"/>
                </div>
            </div>
        );
    }

    if (data?.totalDocs === 0) {
        return (
            <div className="lg:pt-16 pt-4 lg:px-12">
                <div className="border border-black border-dashed flex items-center justify-center p-8
                    flex-col gap-y-4 bg-white w-full rounded-lg">
                    <InboxIcon />
                    <p className="text-base font-medium">No products found</p>
                </div>
            </div>
        )
    }
    


    return (
        <div className="lg:pt-16 pt-4 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
                <div className="lg:col-span-4">
                    <div className="border rouded-md overflow-hidden bg-white">
                        {data?.docs.map((product, index) => (
                           <CheckoutItem
                              key={product.id}
                              isLast={index === data?.docs.length - 1}
                              imageUrl={product.image?.url}
                              name={product.name}
                              productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                              tenantUrl={generateTenantURL(product.tenant.slug)}
                              tenantName={product.tenant.name}
                              price={product.price}
                              onRemove={() => removeProduct(product.id)}
                           />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <CheckoutSiderbar 
                       total={data?.totalPrice || 0}
                       onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
                       isCanceled={states.cancel}
                       disabled={purchase.isPending}
                    />
                </div>
            </div>
        </div>
    )
}