import { createTRPCRouter } from '../init';
// Make sure that 'authRouter' is exported from the target module, or import the correct member.
import { authRouter } from '@/modules/auth/server/procedures';
import { categoriesRouter } from '@/modules/categories/server/procedures';
import { checkoutRouter } from '@/modules/checkout/server/procedures';
import { productsRouter } from '@/modules/products/server/procedures';
import { tagsRouter } from '@/modules/tags/server/procedures';
import { tenantsRouter } from '@/modules/tenants/server/procedures.';
export const appRouter = createTRPCRouter({
  auth: authRouter,
  tags: tagsRouter,
  tenants: tenantsRouter,
  checkout: checkoutRouter,
  products: productsRouter,
  Categories: categoriesRouter

});
// export type definition of API
export type AppRouter = typeof appRouter;
