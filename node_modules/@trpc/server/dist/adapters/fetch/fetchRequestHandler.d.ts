/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */
import type { AnyRouter } from '../../@trpc/server';
import type { FetchHandlerRequestOptions } from './types';
export declare function fetchRequestHandler<TRouter extends AnyRouter>(opts: FetchHandlerRequestOptions<TRouter>): Promise<Response>;
//# sourceMappingURL=fetchRequestHandler.d.ts.map