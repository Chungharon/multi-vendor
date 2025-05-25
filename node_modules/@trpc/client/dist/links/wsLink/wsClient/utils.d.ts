import type { TRPCRequestInfo } from '@trpc/server/unstable-core-do-not-import';
import type { CallbackOrValue, UrlOptionsWithConnectionParams } from '../../internals/urlWithConnectionParams';
export declare class TRPCWebSocketClosedError extends Error {
    constructor(opts: {
        message: string;
        cause?: unknown;
    });
}
/**
 * Utility class for managing a timeout that can be started, stopped, and reset.
 * Useful for scenarios where the timeout duration is reset dynamically based on events.
 */
export declare class ResettableTimeout {
    private readonly onTimeout;
    private readonly timeoutMs;
    private timeout;
    constructor(onTimeout: () => void, timeoutMs: number);
    /**
     * Resets the current timeout, restarting it with the same duration.
     * Does nothing if no timeout is active.
     */
    reset(): void;
    start(): void;
    stop(): void;
}
export declare function withResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};
/**
 * Resolves a WebSocket URL and optionally appends connection parameters.
 *
 * If connectionParams are provided, appends 'connectionParams=1' query parameter.
 */
export declare function prepareUrl(urlOptions: UrlOptionsWithConnectionParams): Promise<string>;
export declare function buildConnectionMessage(connectionParams: CallbackOrValue<TRPCRequestInfo['connectionParams']>): Promise<string>;
//# sourceMappingURL=utils.d.ts.map