import { useCartStore } from "../store/use-cart-store"

export const useCart = (tenantSlug: string) => {
    const {
        getCartByTenant,
        addProduct,
        removeProduct,
        clearCart,
        clearAllCarts,
    } = useCartStore();

    const productIds = getCartByTenant(tenantSlug);

    const toggleProduct = (productId: string) => {
        if (productId.includes(productId)) {
            removeProduct(tenantSlug, productId);
        } else {
            addProduct(tenantSlug, productId);
        }
    };

    const isProductInCart = (productId: string) => {
        return productIds.includes(productId);
    };

    const clearTenantCart = () => {
        clearCart(tenantSlug);
    }

    return {
        productIds,
        addProduct: (productId: string) => addProduct(tenantSlug, productId),
        removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
        toggleProduct,
        isProductInCart,
        clearAllCarts,
        clearCart: clearTenantCart,
        totalItems: productIds.length,
    }
}