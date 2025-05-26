import { createTRPCRouter } from '../init';
// Make sure that 'authRouter' is exported from the target module, or import the correct member.
import { authRouter } from '@/modules/auth/server/procedures';
import { categoriesRouter } from '@/modules/categories/server/procedures';
export const appRouter = createTRPCRouter({
  auth: authRouter,
  Categories: categoriesRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
