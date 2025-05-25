import type { AnyRouter } from '@trpc/server/unstable-core-do-not-import';
import type { CreateTRPCClientOptions } from './internals/TRPCUntypedClient';
import { TRPCUntypedClient } from './internals/TRPCUntypedClient';
export declare function createTRPCUntypedClient<TRouter extends AnyRouter>(opts: CreateTRPCClientOptions<TRouter>): TRPCUntypedClient<TRouter>;
export type { CreateTRPCClientOptions, TRPCRequestOptions, } from './internals/TRPCUntypedClient';
export { TRPCUntypedClient } from './internals/TRPCUntypedClient';
//# sourceMappingURL=createTRPCUntypedClient.d.ts.map