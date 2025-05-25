import { getErrorShape } from '../../unstable-core-do-not-import/error/getErrorShape.mjs';
import { getTRPCErrorFromUnknown } from '../../unstable-core-do-not-import/error/TRPCError.mjs';
import { transformTRPCResponse } from '../../unstable-core-do-not-import/transformer.mjs';
import { run } from '../../unstable-core-do-not-import/utils.mjs';
import { resolveResponse } from '../../unstable-core-do-not-import/http/resolveResponse.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import { incomingMessageToRequest } from './incomingMessageToRequest.mjs';
import { writeResponse } from './writeResponse.mjs';

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
        const error = getTRPCErrorFromUnknown(cause);
        const shape = getErrorShape({
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
        const transformed = transformTRPCResponse(opts.router._def._config, {
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
            run(async ()=>{
                const request = incomingMessageToRequest(opts.req, opts.res, {
                    maxBodySize: opts.maxBodySize ?? null
                });
                // Build tRPC dependencies
                const createContext = async (innerOpts)=>{
                    return await opts.createContext?.({
                        ...opts,
                        ...innerOpts
                    });
                };
                const response = await resolveResponse({
                    ...opts,
                    req: request,
                    error: err ? getTRPCErrorFromUnknown(err) : null,
                    createContext,
                    onError (o) {
                        opts?.onError?.({
                            ...o,
                            req: opts.req
                        });
                    }
                });
                await writeResponse({
                    request,
                    response,
                    rawResponse: opts.res
                });
            }).catch(internal_exceptionHandler(opts));
        });
    });
}

export { internal_exceptionHandler, nodeHTTPRequestHandler };
