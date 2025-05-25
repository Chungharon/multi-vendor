'use strict';

var getErrorShape = require('../../unstable-core-do-not-import/error/getErrorShape.js');
var TRPCError = require('../../unstable-core-do-not-import/error/TRPCError.js');
var transformer = require('../../unstable-core-do-not-import/transformer.js');
var utils = require('../../unstable-core-do-not-import/utils.js');
var resolveResponse = require('../../unstable-core-do-not-import/http/resolveResponse.js');
require('../../unstable-core-do-not-import/rootConfig.js');
require('../../vendor/unpromise/unpromise.js');
require('../../unstable-core-do-not-import/stream/utils/disposable.js');
var incomingMessageToRequest = require('./incomingMessageToRequest.js');
var writeResponse = require('./writeResponse.js');

/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */ // @trpc/server
/**
 * @internal
 */ function internal_exceptionHandler(opts) {
    return (cause)=>{
        const { res, req } = opts;
        const error = TRPCError.getTRPCErrorFromUnknown(cause);
        const shape = getErrorShape.getErrorShape({
            config: opts.router._def._config,
            error,
            type: 'unknown',
            path: undefined,
            input: undefined,
            ctx: undefined
        });
        opts.onError?.({
            req,
            error,
            type: 'unknown',
            path: undefined,
            input: undefined,
            ctx: undefined
        });
        const transformed = transformer.transformTRPCResponse(opts.router._def._config, {
            error: shape
        });
        res.statusCode = shape.data.httpStatus;
        res.end(JSON.stringify(transformed));
    };
}
/**
 * @remark the promise never rejects
 */ async function nodeHTTPRequestHandler(opts) {
    return new Promise((resolve)=>{
        const handleViaMiddleware = opts.middleware ?? ((_req, _res, next)=>next());
        opts.res.once('finish', ()=>{
            resolve();
        });
        return handleViaMiddleware(opts.req, opts.res, (err)=>{
            utils.run(async ()=>{
                const request = incomingMessageToRequest.incomingMessageToRequest(opts.req, opts.res, {
                    maxBodySize: opts.maxBodySize ?? null
                });
                // Build tRPC dependencies
                const createContext = async (innerOpts)=>{
                    return await opts.createContext?.({
                        ...opts,
                        ...innerOpts
                    });
                };
                const response = await resolveResponse.resolveResponse({
                    ...opts,
                    req: request,
                    error: err ? TRPCError.getTRPCErrorFromUnknown(err) : null,
                    createContext,
                    onError (o) {
                        opts?.onError?.({
                            ...o,
                            req: opts.req
                        });
                    }
                });
                await writeResponse.writeResponse({
                    request,
                    response,
                    rawResponse: opts.res
                });
            }).catch(internal_exceptionHandler(opts));
        });
    });
}

exports.internal_exceptionHandler = internal_exceptionHandler;
exports.nodeHTTPRequestHandler = nodeHTTPRequestHandler;
