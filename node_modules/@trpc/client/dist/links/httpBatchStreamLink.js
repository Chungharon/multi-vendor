'use strict';

var observable = require('@trpc/server/observable');
var unstableCoreDoNotImport = require('@trpc/server/unstable-core-do-not-import');
var dataLoader = require('../internals/dataLoader.js');
var signals = require('../internals/signals.js');
var TRPCClientError = require('../TRPCClientError.js');
var httpUtils = require('./internals/httpUtils.js');

/**
 * @see https://trpc.io/docs/client/links/httpBatchStreamLink
 */ function httpBatchStreamLink(opts) {
    const resolvedOpts = httpUtils.resolveHTTPLinkOptions(opts);
    const maxURLLength = opts.maxURLLength ?? Infinity;
    const maxItems = opts.maxItems ?? Infinity;
    return ()=>{
        const batchLoader = (type)=>{
            return {
                validate (batchOps) {
                    if (maxURLLength === Infinity && maxItems === Infinity) {
                        // escape hatch for quick calcs
                        return true;
                    }
                    if (batchOps.length > maxItems) {
                        return false;
                    }
                    const path = batchOps.map((op)=>op.path).join(',');
                    const inputs = batchOps.map((op)=>op.input);
                    const url = httpUtils.getUrl({
                        ...resolvedOpts,
                        type,
                        path,
                        inputs,
                        signal: null
                    });
                    return url.length <= maxURLLength;
                },
                async fetch (batchOps) {
                    const path = batchOps.map((op)=>op.path).join(',');
                    const inputs = batchOps.map((op)=>op.input);
                    const batchSignals = signals.allAbortSignals(...batchOps.map((op)=>op.signal));
                    const abortController = new AbortController();
                    const responsePromise = httpUtils.fetchHTTPResponse({
                        ...resolvedOpts,
                        signal: signals.raceAbortSignals(batchSignals, abortController.signal),
                        type,
                        contentTypeHeader: 'application/json',
                        trpcAcceptHeader: 'application/jsonl',
                        getUrl: httpUtils.getUrl,
                        getBody: httpUtils.getBody,
                        inputs,
                        path,
                        headers () {
                            if (!opts.headers) {
                                return {};
                            }
                            if (typeof opts.headers === 'function') {
                                return opts.headers({
                                    opList: batchOps
                                });
                            }
                            return opts.headers;
                        }
                    });
                    const res = await responsePromise;
                    const [head] = await unstableCoreDoNotImport.jsonlStreamConsumer({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        from: res.body,
                        deserialize: resolvedOpts.transformer.output.deserialize,
                        // onError: console.error,
                        formatError (opts) {
                            const error = opts.error;
                            return TRPCClientError.TRPCClientError.from({
                                error
                            });
                        },
                        abortController
                    });
                    const promises = Object.keys(batchOps).map(async (key)=>{
                        let json = await Promise.resolve(head[key]);
                        if ('result' in json) {
                            /**
                 * Not very pretty, but we need to unwrap nested data as promises
                 * Our stream producer will only resolve top-level async values or async values that are directly nested in another async value
                 */ const result = await Promise.resolve(json.result);
                            json = {
                                result: {
                                    data: await Promise.resolve(result.data)
                                }
                            };
                        }
                        return {
                            json,
                            meta: {
                                response: res
                            }
                        };
                    });
                    return promises;
                }
            };
        };
        const query = dataLoader.dataLoader(batchLoader('query'));
        const mutation = dataLoader.dataLoader(batchLoader('mutation'));
        const loaders = {
            query,
            mutation
        };
        return ({ op })=>{
            return observable.observable((observer)=>{
                /* istanbul ignore if -- @preserve */ if (op.type === 'subscription') {
                    throw new Error('Subscriptions are unsupported by `httpBatchStreamLink` - use `httpSubscriptionLink` or `wsLink`');
                }
                const loader = loaders[op.type];
                const promise = loader.load(op);
                let _res = undefined;
                promise.then((res)=>{
                    _res = res;
                    if ('error' in res.json) {
                        observer.error(TRPCClientError.TRPCClientError.from(res.json, {
                            meta: res.meta
                        }));
                        return;
                    } else if ('result' in res.json) {
                        observer.next({
                            context: res.meta,
                            result: res.json.result
                        });
                        observer.complete();
                        return;
                    }
                    observer.complete();
                }).catch((err)=>{
                    observer.error(TRPCClientError.TRPCClientError.from(err, {
                        meta: _res?.meta
                    }));
                });
                return ()=>{
                // noop
                };
            });
        };
    };
}
/**
 * @deprecated use {@link httpBatchStreamLink} instead
 */ const unstable_httpBatchStreamLink = httpBatchStreamLink;

exports.httpBatchStreamLink = httpBatchStreamLink;
exports.unstable_httpBatchStreamLink = unstable_httpBatchStreamLink;
