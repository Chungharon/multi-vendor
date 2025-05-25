import { observable } from '@trpc/server/observable';
import { transformResult } from '@trpc/server/unstable-core-do-not-import';
import { dataLoader } from '../internals/dataLoader.mjs';
import { allAbortSignals } from '../internals/signals.mjs';
import { TRPCClientError } from '../TRPCClientError.mjs';
import { resolveHTTPLinkOptions, jsonHttpRequester, getUrl } from './internals/httpUtils.mjs';

/**
 * @see https://trpc.io/docs/client/links/httpBatchLink
 */ function httpBatchLink(opts) {
    const resolvedOpts = resolveHTTPLinkOptions(opts);
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
                    const url = getUrl({
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
                    const signal = allAbortSignals(...batchOps.map((op)=>op.signal));
                    const res = await jsonHttpRequester({
                        ...resolvedOpts,
                        path,
                        inputs,
                        type,
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
                        },
                        signal
                    });
                    const resJSON = Array.isArray(res.json) ? res.json : batchOps.map(()=>res.json);
                    const result = resJSON.map((item)=>({
                            meta: res.meta,
                            json: item
                        }));
                    return result;
                }
            };
        };
        const query = dataLoader(batchLoader('query'));
        const mutation = dataLoader(batchLoader('mutation'));
        const loaders = {
            query,
            mutation
        };
        return ({ op })=>{
            return observable((observer)=>{
                /* istanbul ignore if -- @preserve */ if (op.type === 'subscription') {
                    throw new Error('Subscriptions are unsupported by `httpLink` - use `httpSubscriptionLink` or `wsLink`');
                }
                const loader = loaders[op.type];
                const promise = loader.load(op);
                let _res = undefined;
                promise.then((res)=>{
                    _res = res;
                    const transformed = transformResult(res.json, resolvedOpts.transformer.output);
                    if (!transformed.ok) {
                        observer.error(TRPCClientError.from(transformed.error, {
                            meta: res.meta
                        }));
                        return;
                    }
                    observer.next({
                        context: res.meta,
                        result: transformed.result
                    });
                    observer.complete();
                }).catch((err)=>{
                    observer.error(TRPCClientError.from(err, {
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

export { httpBatchLink };
