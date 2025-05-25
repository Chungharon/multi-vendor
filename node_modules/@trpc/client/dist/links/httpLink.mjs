import { observable } from '@trpc/server/observable';
import { transformResult } from '@trpc/server/unstable-core-do-not-import';
import { TRPCClientError } from '../TRPCClientError.mjs';
import { resolveHTTPLinkOptions, httpRequest, jsonHttpRequester, getUrl } from './internals/httpUtils.mjs';
import { isFormData, isOctetType } from './internals/contentTypes.mjs';

const universalRequester = (opts)=>{
    if ('input' in opts) {
        const { input } = opts;
        if (isFormData(input)) {
            if (opts.type !== 'mutation' && opts.methodOverride !== 'POST') {
                throw new Error('FormData is only supported for mutations');
            }
            return httpRequest({
                ...opts,
                // The browser will set this automatically and include the boundary= in it
                contentTypeHeader: undefined,
                getUrl,
                getBody: ()=>input
            });
        }
        if (isOctetType(input)) {
            if (opts.type !== 'mutation' && opts.methodOverride !== 'POST') {
                throw new Error('Octet type input is only supported for mutations');
            }
            return httpRequest({
                ...opts,
                contentTypeHeader: 'application/octet-stream',
                getUrl,
                getBody: ()=>input
            });
        }
    }
    return jsonHttpRequester(opts);
};
/**
 * @see https://trpc.io/docs/client/links/httpLink
 */ function httpLink(opts) {
    const resolvedOpts = resolveHTTPLinkOptions(opts);
    return ()=>{
        return ({ op })=>{
            return observable((observer)=>{
                const { path, input, type } = op;
                /* istanbul ignore if -- @preserve */ if (type === 'subscription') {
                    throw new Error('Subscriptions are unsupported by `httpLink` - use `httpSubscriptionLink` or `wsLink`');
                }
                const request = universalRequester({
                    ...resolvedOpts,
                    type,
                    path,
                    input,
                    signal: op.signal,
                    headers () {
                        if (!opts.headers) {
                            return {};
                        }
                        if (typeof opts.headers === 'function') {
                            return opts.headers({
                                op
                            });
                        }
                        return opts.headers;
                    }
                });
                let meta = undefined;
                request.then((res)=>{
                    meta = res.meta;
                    const transformed = transformResult(res.json, resolvedOpts.transformer.output);
                    if (!transformed.ok) {
                        observer.error(TRPCClientError.from(transformed.error, {
                            meta
                        }));
                        return;
                    }
                    observer.next({
                        context: res.meta,
                        result: transformed.result
                    });
                    observer.complete();
                }).catch((cause)=>{
                    observer.error(TRPCClientError.from(cause, {
                        meta
                    }));
                });
                return ()=>{
                // noop
                };
            });
        };
    };
}

export { httpLink };
