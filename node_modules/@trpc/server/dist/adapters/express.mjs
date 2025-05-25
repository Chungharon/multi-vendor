import { run } from '../unstable-core-do-not-import/utils.mjs';
import '../vendor/unpromise/unpromise.mjs';
import '../unstable-core-do-not-import/stream/utils/disposable.mjs';
import '../unstable-core-do-not-import/rootConfig.mjs';
import { nodeHTTPRequestHandler, internal_exceptionHandler } from './node-http/nodeHTTPRequestHandler.mjs';

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
        run(async ()=>{
            path = req.path.slice(req.path.lastIndexOf('/') + 1);
            await nodeHTTPRequestHandler({
                ...opts,
                req,
                res,
                path
            });
        }).catch(internal_exceptionHandler({
            req,
            res,
            path,
            ...opts
        }));
    };
}

export { createExpressMiddleware };
