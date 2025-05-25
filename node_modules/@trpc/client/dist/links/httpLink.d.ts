import type { AnyClientTypes, AnyRouter } from '@trpc/server/unstable-core-do-not-import';
import type { HTTPLinkBaseOptions } from './internals/httpUtils';
import { type HTTPHeaders, type Operation, type TRPCLink } from './types';
export type HTTPLinkOptions<TRoot extends AnyClientTypes> = HTTPLinkBaseOptions<TRoot> & {
    /**
     * Headers to be set on outgoing requests or a callback that of said headers
     * @see http://trpc.io/docs/client/headers
     */
    headers?: HTTPHeaders | ((opts: {
        op: Operation;
    }) => HTTPHeaders | Promise<HTTPHeaders>);
};
/**
 * @see https://trpc.io/docs/client/links/httpLink
 */
export declare function httpLink<TRouter extends AnyRouter = AnyRouter>(opts: HTTPLinkOptions<TRouter['_def']['_config']['$types']>): TRPCLink<TRouter>;
//# sourceMappingURL=httpLink.d.ts.map