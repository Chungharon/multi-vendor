import { resolveResponse } from '../../unstable-core-do-not-import/http/resolveResponse.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import { incomingMessageToRequest } from '../node-http/incomingMessageToRequest.mjs';

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
    const req = incomingMessageToRequest(incomingMessage, opts.res.raw, {
        maxBodySize: null
    });
    const res = await resolveResponse({
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

export { fastifyRequestHandler };
