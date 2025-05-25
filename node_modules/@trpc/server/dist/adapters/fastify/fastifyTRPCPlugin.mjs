import { getWSConnectionHandler, handleKeepAlive } from '../ws.mjs';
import { fastifyRequestHandler } from './fastifyRequestHandler.mjs';

/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */ /// <reference types="@fastify/websocket" />
// @trpc/server/ws
function fastifyTRPCPlugin(fastify, opts, done) {
    fastify.removeContentTypeParser('application/json');
    fastify.addContentTypeParser('application/json', {
        parseAs: 'string'
    }, function(_, body, _done) {
        _done(null, body);
    });
    let prefix = opts.prefix ?? '';
    // https://github.com/fastify/fastify-plugin/blob/fe079bef6557a83794bf437e14b9b9edb8a74104/plugin.js#L11
    // @ts-expect-error property 'default' does not exists on type ...
    if (typeof fastifyTRPCPlugin.default !== 'function') {
        prefix = ''; // handled by fastify internally
    }
    fastify.all(`${prefix}/:path`, async (req, res)=>{
        const path = req.params.path;
        await fastifyRequestHandler({
            ...opts.trpcOptions,
            req,
            res,
            path
        });
    });
    if (opts.useWSS) {
        const trpcOptions = opts.trpcOptions;
        const onConnection = getWSConnectionHandler({
            ...trpcOptions
        });
        fastify.get(prefix ?? '/', {
            websocket: true
        }, (socket, req)=>{
            onConnection(socket, req.raw);
            if (trpcOptions?.keepAlive?.enabled) {
                const { pingMs, pongWaitMs } = trpcOptions.keepAlive;
                handleKeepAlive(socket, pingMs, pongWaitMs);
            }
        });
    }
    done();
}

export { fastifyTRPCPlugin };
