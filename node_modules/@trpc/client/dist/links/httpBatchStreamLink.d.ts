import type { AnyRouter } from '@trpc/server';
import type { HTTPBatchLinkOptions } from './HTTPBatchLinkOptions';
import type { TRPCLink } from './types';
/**
 * @see https://trpc.io/docs/client/links/httpBatchStreamLink
 */
export declare function httpBatchStreamLink<TRouter extends AnyRouter>(opts: HTTPBatchLinkOptions<TRouter['_def']['_config']['$types']>): TRPCLink<TRouter>;
/**
 * @deprecated use {@link httpBatchStreamLink} instead
 */
export declare const unstable_httpBatchStreamLink: typeof httpBatchStreamLink;
//# sourceMappingURL=httpBatchStreamLink.d.ts.map