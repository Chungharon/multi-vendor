import { useCallback } from "react";
import { useCartStore } from "../store/use-cart-store"
import { useShallow } from "zustand/react/shallow";

export const useCart = (tenantSlug: string) => {
    // const {
    //     getCartByTenant,
    //     addProduct,
    //     removeProduct,
    //     clearCart,
    //     clearAllCarts,
    // } = useCartStore();

    const addProduct = useCartStore((state) => state.addProduct);
    const removeProduct = useCartStore((state) => state.removeProduct);
    const clearCart = useCartStore((state) => state.clearCart);
    const clearAllCarts = useCartStore((state) => state.clearAllCarts);
    const productIds = useCartStore(useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || []));

    const toggleProduct = useCallback((productId: string) => {
        if (productId.includes(productId)) {
            removeProduct(tenantSlug, productId);
        } else {
            addProduct(tenantSlug, productId);
        }
    }, [addProduct, removeProduct, productIds, tenantSlug]);

    const isProductInCart = useCallback((productId: string) => {
        return productIds.includes(productId);
    }, [productIds]);

    const clearTenantCart = useCallback(() => {
        clearCart(tenantSlug);
    }, [tenantSlug, clearCart]);

    const handleAddProduct = useCallback((productId: string) => {
        addProduct(tenantSlug, productId);
    }, [addProduct, tenantSlug]);

    const handleRemoveProduct = useCallback((productId: string) => {
        removeProduct(tenantSlug, productId);
    }, [removeProduct, tenantSlug]);



    return {
        productIds,
        addProduct: handleAddProduct,
        removeProduct: handleRemoveProduct,
        toggleProduct,
        isProductInCart,
        clearAllCarts,
        clearCart: clearTenantCart,
        totalItems: productIds.length,
    }
}