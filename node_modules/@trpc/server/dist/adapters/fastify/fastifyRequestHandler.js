'use strict';

var resolveResponse = require('../../unstable-core-do-not-import/http/resolveResponse.js');
require('../../unstable-core-do-not-import/rootConfig.js');
require('../../vendor/unpromise/unpromise.js');
require('../../unstable-core-do-not-import/stream/utils/disposable.js');
var incomingMessageToRequest = require('../node-http/incomingMessageToRequest.js');

/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */ // @trpc/server/http
async function fastifyRequestHandler(opts) {
    const createContext = async (innerOpts)=>{
        return await opts.createContext?.({
            ...opts,
            ...innerOpts
        });
    };
    const incomingMessage = opts.req.raw;
    // monkey-path body to the IncomingMessage
    if ('body' in opts.req) {
        incomingMessage.body = opts.req.body;
    }
    const req = incomingMessageToRequest.incomingMessageToRequest(incomingMessage, opts.res.raw, {
        maxBodySize: null
    });
    const res = await resolveResponse.resolveResponse({
        ...opts,
        req,
        error: null,
        createContext,
        onError (o) {
            opts?.onError?.({
                ...o,
                req: opts.req
            });
        }
    });
    await opts.res.send(res);
}

exports.fastifyRequestHandler = fastifyRequestHandler;
