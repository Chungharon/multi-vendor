'use strict';

var observable = require('@trpc/server/observable');
var unstableCoreDoNotImport = require('@trpc/server/unstable-core-do-not-import');
var TRPCClientError = require('../TRPCClientError.js');
var httpUtils = require('./internals/httpUtils.js');
var contentTypes = require('./internals/contentTypes.js');

const universalRequester = (opts)=>{
    if ('input' in opts) {
        const { input } = opts;
        if (contentTypes.isFormData(input)) {
            if (opts.type !== 'mutation' && opts.methodOverride !== 'POST') {
                throw new Error('FormData is only supported for mutations');
            }
            return httpUtils.httpRequest({
                ...opts,
                // The browser will set this automatically and include the boundary= in it
                contentTypeHeader: undefined,
                getUrl: httpUtils.getUrl,
                getBody: ()=>input
            });
        }
        if (contentTypes.isOctetType(input)) {
            if (opts.type !== 'mutation' && opts.methodOverride !== 'POST') {
                throw new Error('Octet type input is only supported for mutations');
            }
            return httpUtils.httpRequest({
                ...opts,
                contentTypeHeader: 'application/octet-stream',
                getUrl: httpUtils.getUrl,
                getBody: ()=>input
            });
        }
    }
    return httpUtils.jsonHttpRequester(opts);
};
/**
 * @see https://trpc.io/docs/client/links/httpLink
 */ function httpLink(opts) {
    const resolvedOpts = httpUtils.resolveHTTPLinkOptions(opts);
    return ()=>{
        return ({ op })=>{
            return observable.observable((observer)=>{
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
                    const transformed = unstableCoreDoNotImport.transformResult(res.json, resolvedOpts.transformer.output);
                    if (!transformed.ok) {
                        observer.error(TRPCClientError.TRPCClientError.from(transformed.error, {
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
                    observer.error(TRPCClientError.TRPCClientError.from(cause, {
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

exports.httpLink = httpLink;
