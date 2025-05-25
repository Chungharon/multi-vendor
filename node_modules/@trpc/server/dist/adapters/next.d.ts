/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { AnyRouter } from '../@trpc/server';
import type { NodeHTTPCreateContextFnOptions, NodeHTTPHandlerOptions } from './node-http';
export type CreateNextContextOptions = NodeHTTPCreateContextFnOptions<NextApiRequest, NextApiResponse>;
/**
 * Preventing "TypeScript where it's tough not to get "The inferred type of 'xxxx' cannot be named without a reference to [...]"
 */
export type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
export declare function createNextApiHandler<TRouter extends AnyRouter>(opts: NodeHTTPHandlerOptions<TRouter, NextApiRequest, NextApiResponse>): NextApiHandler;
//# sourceMappingURL=next.d.ts.map