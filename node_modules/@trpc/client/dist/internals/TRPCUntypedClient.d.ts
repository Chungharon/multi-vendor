import type { Unsubscribable } from '@trpc/server/observable';
import type { AnyRouter, inferAsyncIterableYield, InferrableClientTypes, TypeError } from '@trpc/server/unstable-core-do-not-import';
import type { TRPCConnectionState } from '../links/internals/subscriptions';
import type { OperationContext, TRPCClientRuntime, TRPCLink } from '../links/types';
import { TRPCClientError } from '../TRPCClientError';
export interface TRPCRequestOptions {
    /**
     * Pass additional context to links
     */
    context?: OperationContext;
    signal?: AbortSignal;
}
export interface TRPCSubscriptionObserver<TValue, TError> {
    onStarted: (opts: {
        context: OperationContext | undefined;
    }) => void;
    onData: (value: inferAsyncIterableYield<TValue>) => void;
    onError: (err: TError) => void;
    onStopped: () => void;
    onComplete: () => void;
    onConnectionStateChange: (state: TRPCConnectionState<TError>) => void;
}
/** @internal */
export type CreateTRPCClientOptions<TRouter extends InferrableClientTypes> = {
    links: TRPCLink<TRouter>[];
    transformer?: TypeError<'The transformer property has moved to httpLink/httpBatchLink/wsLink'>;
};
export declare class TRPCUntypedClient<TInferrable extends InferrableClientTypes> {
    private readonly links;
    readonly runtime: TRPCClientRuntime;
    private requestId;
    constructor(opts: CreateTRPCClientOptions<TInferrable>);
    private $request;
    private requestAsPromise;
    query(path: string, input?: unknown, opts?: TRPCRequestOptions): Promise<unknown>;
    mutation(path: string, input?: unknown, opts?: TRPCRequestOptions): Promise<unknown>;
    subscription(path: string, input: unknown, opts: Partial<TRPCSubscriptionObserver<unknown, TRPCClientError<AnyRouter>>> & TRPCRequestOptions): Unsubscribable;
}
//# sourceMappingURL=TRPCUntypedClient.d.ts.map