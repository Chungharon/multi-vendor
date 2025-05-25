'use strict';

var utils = require('../unstable-core-do-not-import/utils.js');
var TRPCError = require('../unstable-core-do-not-import/error/TRPCError.js');
require('../vendor/unpromise/unpromise.js');
require('../unstable-core-do-not-import/stream/utils/disposable.js');
require('../unstable-core-do-not-import/rootConfig.js');
var nodeHTTPRequestHandler = require('./node-http/nodeHTTPRequestHandler.js');

/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */ // @trpc/server
function createNextApiHandler(opts) {
    return async (req, res)=>{
        let path = '';
        await utils.run(async ()=>{
            path = utils.run(()=>{
                if (typeof req.query['trpc'] === 'string') {
                    return req.query['trpc'];
                }
                if (Array.isArray(req.query['trpc'])) {
                    return req.query['trpc'].join('/');
                }
                throw new TRPCError.TRPCError({
                    message: 'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
                    code: 'INTERNAL_SERVER_ERROR'
                });
            });
            await nodeHTTPRequestHandler.nodeHTTPRequestHandler({
                ...opts,
                req,
                res,
                path
            });
        }).catch(nodeHTTPRequestHandler.internal_exceptionHandler({
            req,
            res,
            path,
            ...opts
        }));
    };
}

exports.createNextApiHandler = createNextApiHandler;
