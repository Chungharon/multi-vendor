import type { InferrableClientTypes } from '@trpc/server/unstable-core-do-not-import';
import type { TRPCClientError } from '../TRPCClientError';
import type { Operation, TRPCLink } from './types';
interface RetryLinkOptions<TInferrable extends InferrableClientTypes> {
    /**
     * The retry function
     */
    retry: (opts: RetryFnOptions<TInferrable>) => boolean;
    /**
     * The delay between retries in ms (defaults to 0)
     */
    retryDelayMs?: (attempt: number) => number;
}
interface RetryFnOptions<TInferrable extends InferrableClientTypes> {
    /**
     * The operation that failed
     */
    op: Operation;
    /**
     * The error that occurred
     */
    error: TRPCClientError<TInferrable>;
    /**
     * The number of attempts that have been made (including the first call)
     */
    attempts: number;
}
/**
 * @see https://trpc.io/docs/v11/client/links/retryLink
 */
export declare function retryLink<TInferrable extends InferrableClientTypes>(opts: RetryLinkOptions<TInferrable>): TRPCLink<TInferrable>;
export {};
//# sourceMappingURL=retryLink.d.ts.map