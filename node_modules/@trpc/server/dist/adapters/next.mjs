import { run } from '../unstable-core-do-not-import/utils.mjs';
import { TRPCError } from '../unstable-core-do-not-import/error/TRPCError.mjs';
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
 */ // @trpc/server
function createNextApiHandler(opts) {
    return async (req, res)=>{
        let path = '';
        await run(async ()=>{
            path = run(()=>{
                if (typeof req.query['trpc'] === 'string') {
                    return req.query['trpc'];
                }
                if (Array.isArray(req.query['trpc'])) {
                    return req.query['trpc'].join('/');
                }
                throw new TRPCError({
                    message: 'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
                    code: 'INTERNAL_SERVER_ERROR'
                });
            });
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

export { createNextApiHandler };
