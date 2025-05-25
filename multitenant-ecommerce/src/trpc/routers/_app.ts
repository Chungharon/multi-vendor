import { createTRPCRouter } from '../init';
import { categoriesRouter } from '@/modules/categories/server/procedures';
export const appRouter = createTRPCRouter({
  Categories: categoriesRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;