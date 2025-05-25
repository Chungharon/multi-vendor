import type { AnyRouter } from '@trpc/server';
import type { HTTPBatchLinkOptions } from './HTTPBatchLinkOptions';
import type { TRPCLink } from './types';
/**
 * @see https://trpc.io/docs/client/links/httpBatchLink
 */
export declare function httpBatchLink<TRouter extends AnyRouter>(opts: HTTPBatchLinkOptions<TRouter['_def']['_config']['$types']>): TRPCLink<TRouter>;
//# sourceMappingURL=httpBatchLink.d.ts.map