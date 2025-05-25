/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */
import { type AnyRouter } from '../../@trpc/server';
import type { NodeHTTPRequest, NodeHTTPRequestHandlerOptions, NodeHTTPResponse } from './types';
/**
 * @internal
 */
export declare function internal_exceptionHandler<TRouter extends AnyRouter, TRequest extends NodeHTTPRequest, TResponse extends NodeHTTPResponse>(opts: NodeHTTPRequestHandlerOptions<TRouter, TRequest, TResponse>): (cause: unknown) => void;
/**
 * @remark the promise never rejects
 */
export declare function nodeHTTPRequestHandler<TRouter extends AnyRouter, TRequest extends NodeHTTPRequest, TResponse extends NodeHTTPResponse>(opts: NodeHTTPRequestHandlerOptions<TRouter, TRequest, TResponse>): Promise<void>;
//# sourceMappingURL=nodeHTTPRequestHandler.d.ts.map