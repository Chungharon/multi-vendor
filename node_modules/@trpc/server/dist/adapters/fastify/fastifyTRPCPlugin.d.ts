/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AnyRouter } from '../../@trpc/server';
import type { NodeHTTPCreateContextFnOptions } from '../node-http';
import type { FastifyHandlerOptions } from './fastifyRequestHandler';
export interface FastifyTRPCPluginOptions<TRouter extends AnyRouter> {
    prefix?: string;
    useWSS?: boolean;
    trpcOptions: FastifyHandlerOptions<TRouter, FastifyRequest, FastifyReply>;
}
export type CreateFastifyContextOptions = NodeHTTPCreateContextFnOptions<FastifyRequest, FastifyReply>;
export declare function fastifyTRPCPlugin<TRouter extends AnyRouter>(fastify: FastifyInstance, opts: FastifyTRPCPluginOptions<TRouter>, done: (err?: Error) => void): void;
//# sourceMappingURL=fastifyTRPCPlugin.d.ts.map