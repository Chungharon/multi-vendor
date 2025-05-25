'use strict';

var utils = require('../unstable-core-do-not-import/utils.js');
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
 */ // eslint-disable-next-line no-restricted-imports
function createExpressMiddleware(opts) {
    return (req, res)=>{
        let path = '';
        utils.run(async ()=>{
            path = req.path.slice(req.path.lastIndexOf('/') + 1);
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

exports.createExpressMiddleware = createExpressMiddleware;
