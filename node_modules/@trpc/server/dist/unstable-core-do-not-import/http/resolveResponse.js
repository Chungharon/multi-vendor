'use strict';

var observable = require('../../observable/observable.js');
var getErrorShape = require('../error/getErrorShape.js');
var TRPCError = require('../error/TRPCError.js');
var jsonl = require('../stream/jsonl.js');
var sse = require('../stream/sse.js');
var transformer = require('../transformer.js');
var utils = require('../utils.js');
var contentType = require('./contentType.js');
var getHTTPStatusCode = require('./getHTTPStatusCode.js');

function errorToAsyncIterable(err) {
    return utils.run(async function*() {
        throw err;
    });
}
const TYPE_ACCEPTED_METHOD_MAP = {
    mutation: [
        'POST'
    ],
    query: [
        'GET'
    ],
    subscription: [
        'GET'
    ]
};
const TYPE_ACCEPTED_METHOD_MAP_WITH_METHOD_OVERRIDE = {
    // never allow GET to do a mutation
    mutation: [
        'POST'
    ],
    query: [
        'GET',
        'POST'
    ],
    subscription: [
        'GET',
        'POST'
    ]
};
function initResponse(initOpts) {
    const { ctx, info, responseMeta, untransformedJSON, errors = [], headers } = initOpts;
    let status = untransformedJSON ? getHTTPStatusCode.getHTTPStatusCode(untransformedJSON) : 200;
    const eagerGeneration = !untransformedJSON;
    const data = eagerGeneration ? [] : Array.isArray(untransformedJSON) ? untransformedJSON : [
        untransformedJSON
    ];
    const meta = responseMeta?.({
        ctx,
        info,
        paths: info?.calls.map((call)=>call.path),
        data,
        errors,
        eagerGeneration,
        type: info?.calls.find((call)=>call.procedure?._def.type)?.procedure?._def.type ?? 'unknown'
    }) ?? {};
    if (meta.headers) {
        if (meta.headers instanceof Headers) {
            for (const [key, value] of meta.headers.entries()){
                headers.append(key, value);
            }
        } else {
            /**
       * @deprecated, delete in v12
       */ for (const [key, value] of Object.entries(meta.headers)){
                if (Array.isArray(value)) {
                    for (const v of value){
                        headers.append(key, v);
                    }
                } else if (typeof value === 'string') {
                    headers.set(key, value);
                }
            }
        }
    }
    if (meta.status) {
        status = meta.status;
    }
    return {
        status
    };
}
function caughtErrorToData(cause, errorOpts) {
    const { router, req, onError } = errorOpts.opts;
    const error = TRPCError.getTRPCErrorFromUnknown(cause);
    onError?.({
        error,
        path: errorOpts.path,
        input: errorOpts.input,
        ctx: errorOpts.ctx,
        type: errorOpts.type,
        req
    });
    const untransformedJSON = {
        error: getErrorShape.getErrorShape({
            config: router._def._config,
            error,
            type: errorOpts.type,
            path: errorOpts.path,
            input: errorOpts.input,
            ctx: errorOpts.ctx
        })
    };
    const transformedJSON = transformer.transformTRPCResponse(router._def._config, untransformedJSON);
    const body = JSON.stringify(transformedJSON);
    return {
        error,
        untransformedJSON,
        body
    };
}
/**
 * Check if a value is a stream-like object
 * - if it's an async iterable
 * - if it's an object with async iterables or promises
 */ function isDataStream(v) {
    if (!utils.isObject(v)) {
        return false;
    }
    if (utils.isAsyncIterable(v)) {
        return true;
    }
    return Object.values(v).some(jsonl.isPromise) || Object.values(v).some(utils.isAsyncIterable);
}
async function resolveResponse(opts) {
    const { router, req } = opts;
    const headers = new Headers([
        [
            'vary',
            'trpc-accept'
        ]
    ]);
    const config = router._def._config;
    const url = new URL(req.url);
    if (req.method === 'HEAD') {
        // can be used for lambda warmup
        return new Response(null, {
            status: 204
        });
    }
    const allowBatching = opts.allowBatching ?? opts.batching?.enabled ?? true;
    const allowMethodOverride = (opts.allowMethodOverride ?? false) && req.method === 'POST';
    const infoTuple = await utils.run(async ()=>{
        try {
            return [
                undefined,
                await contentType.getRequestInfo({
                    req,
                    path: decodeURIComponent(opts.path),
                    router,
                    searchParams: url.searchParams,
                    headers: opts.req.headers,
                    url
                })
            ];
        } catch (cause) {
            return [
                TRPCError.getTRPCErrorFromUnknown(cause),
                undefined
            ];
        }
    });
    const ctxManager = utils.run(()=>{
        let result = undefined;
        return {
            valueOrUndefined: ()=>{
                if (!result) {
                    return undefined;
                }
                return result[1];
            },
            value: ()=>{
                const [err, ctx] = result;
                if (err) {
                    throw err;
                }
                return ctx;
            },
            create: async (info)=>{
                if (result) {
                    throw new Error('This should only be called once - report a bug in tRPC');
                }
                try {
                    const ctx = await opts.createContext({
                        info
                    });
                    result = [
                        undefined,
                        ctx
                    ];
                } catch (cause) {
                    result = [
                        TRPCError.getTRPCErrorFromUnknown(cause),
                        undefined
                    ];
                }
            }
        };
    });
    const methodMapper = allowMethodOverride ? TYPE_ACCEPTED_METHOD_MAP_WITH_METHOD_OVERRIDE : TYPE_ACCEPTED_METHOD_MAP;
    /**
   * @deprecated
   */ const isStreamCall = req.headers.get('trpc-accept') === 'application/jsonl';
    const experimentalSSE = config.sse?.enabled ?? true;
    try {
        const [infoError, info] = infoTuple;
        if (infoError) {
            throw infoError;
        }
        if (info.isBatchCall && !allowBatching) {
            throw new TRPCError.TRPCError({
                code: 'BAD_REQUEST',
                message: `Batching is not enabled on the server`
            });
        }
        /* istanbul ignore if -- @preserve */ if (isStreamCall && !info.isBatchCall) {
            throw new TRPCError.TRPCError({
                message: `Streaming requests must be batched (you can do a batch of 1)`,
                code: 'BAD_REQUEST'
            });
        }
        await ctxManager.create(info);
        const rpcCalls = info.calls.map(async (call)=>{
            const proc = call.procedure;
            try {
                if (opts.error) {
                    throw opts.error;
                }
                if (!proc) {
                    throw new TRPCError.TRPCError({
                        code: 'NOT_FOUND',
                        message: `No procedure found on path "${call.path}"`
                    });
                }
                if (!methodMapper[proc._def.type].includes(req.method)) {
                    throw new TRPCError.TRPCError({
                        code: 'METHOD_NOT_SUPPORTED',
                        message: `Unsupported ${req.method}-request to ${proc._def.type} procedure at path "${call.path}"`
                    });
                }
                if (proc._def.type === 'subscription') {
                    /* istanbul ignore if -- @preserve */ if (info.isBatchCall) {
                        throw new TRPCError.TRPCError({
                            code: 'BAD_REQUEST',
                            message: `Cannot batch subscription calls`
                        });
                    }
                }
                const data = await proc({
                    path: call.path,
                    getRawInput: call.getRawInput,
                    ctx: ctxManager.value(),
                    type: proc._def.type,
                    signal: opts.req.signal
                });
                return [
                    undefined,
                    {
                        data
                    }
                ];
            } catch (cause) {
                const error = TRPCError.getTRPCErrorFromUnknown(cause);
                const input = call.result();
                opts.onError?.({
                    error,
                    path: call.path,
                    input,
                    ctx: ctxManager.valueOrUndefined(),
                    type: call.procedure?._def.type ?? 'unknown',
                    req: opts.req
                });
                return [
                    error,
                    undefined
                ];
            }
        });
        // ----------- response handlers -----------
        if (!info.isBatchCall) {
            const [call] = info.calls;
            const [error, result] = await rpcCalls[0];
            switch(info.type){
                case 'unknown':
                case 'mutation':
                case 'query':
                    {
                        // httpLink
                        headers.set('content-type', 'application/json');
                        if (isDataStream(result?.data)) {
                            throw new TRPCError.TRPCError({
                                code: 'UNSUPPORTED_MEDIA_TYPE',
                                message: 'Cannot use stream-like response in non-streaming request - use httpBatchStreamLink'
                            });
                        }
                        const res = error ? {
                            error: getErrorShape.getErrorShape({
                                config,
                                ctx: ctxManager.valueOrUndefined(),
                                error,
                                input: call.result(),
                                path: call.path,
                                type: info.type
                            })
                        } : {
                            result: {
                                data: result.data
                            }
                        };
                        const headResponse = initResponse({
                            ctx: ctxManager.valueOrUndefined(),
                            info,
                            responseMeta: opts.responseMeta,
                            errors: error ? [
                                error
                            ] : [],
                            headers,
                            untransformedJSON: [
                                res
                            ]
                        });
                        return new Response(JSON.stringify(transformer.transformTRPCResponse(config, res)), {
                            status: headResponse.status,
                            headers
                        });
                    }
                case 'subscription':
                    {
                        // httpSubscriptionLink
                        const iterable = utils.run(()=>{
                            if (error) {
                                return errorToAsyncIterable(error);
                            }
                            if (!experimentalSSE) {
                                return errorToAsyncIterable(new TRPCError.TRPCError({
                                    code: 'METHOD_NOT_SUPPORTED',
                                    message: 'Missing experimental flag "sseSubscriptions"'
                                }));
                            }
                            if (!observable.isObservable(result.data) && !utils.isAsyncIterable(result.data)) {
                                return errorToAsyncIterable(new TRPCError.TRPCError({
                                    message: `Subscription ${call.path} did not return an observable or a AsyncGenerator`,
                                    code: 'INTERNAL_SERVER_ERROR'
                                }));
                            }
                            const dataAsIterable = observable.isObservable(result.data) ? observable.observableToAsyncIterable(result.data, opts.req.signal) : result.data;
                            return dataAsIterable;
                        });
                        const stream = sse.sseStreamProducer({
                            ...config.sse,
                            data: iterable,
                            serialize: (v)=>config.transformer.output.serialize(v),
                            formatError (errorOpts) {
                                const error = TRPCError.getTRPCErrorFromUnknown(errorOpts.error);
                                const input = call?.result();
                                const path = call?.path;
                                const type = call?.procedure?._def.type ?? 'unknown';
                                opts.onError?.({
                                    error,
                                    path,
                                    input,
                                    ctx: ctxManager.valueOrUndefined(),
                                    req: opts.req,
                                    type
                                });
                                const shape = getErrorShape.getErrorShape({
                                    config,
                                    ctx: ctxManager.valueOrUndefined(),
                                    error,
                                    input,
                                    path,
                                    type
                                });
                                return shape;
                            }
                        });
                        for (const [key, value] of Object.entries(sse.sseHeaders)){
                            headers.set(key, value);
                        }
                        const headResponse = initResponse({
                            ctx: ctxManager.valueOrUndefined(),
                            info,
                            responseMeta: opts.responseMeta,
                            errors: [],
                            headers,
                            untransformedJSON: null
                        });
                        return new Response(stream, {
                            headers,
                            status: headResponse.status
                        });
                    }
            }
        }
        // batch response handlers
        if (info.accept === 'application/jsonl') {
            // httpBatchStreamLink
            headers.set('content-type', 'application/json');
            headers.set('transfer-encoding', 'chunked');
            const headResponse = initResponse({
                ctx: ctxManager.valueOrUndefined(),
                info,
                responseMeta: opts.responseMeta,
                errors: [],
                headers,
                untransformedJSON: null
            });
            const stream = jsonl.jsonlStreamProducer({
                ...config.jsonl,
                /**
         * Example structure for `maxDepth: 4`:
         * {
         *   // 1
         *   0: {
         *     // 2
         *     result: {
         *       // 3
         *       data: // 4
         *     }
         *   }
         * }
         */ maxDepth: Infinity,
                data: rpcCalls.map(async (res)=>{
                    const [error, result] = await res;
                    const call = info.calls[0];
                    if (error) {
                        return {
                            error: getErrorShape.getErrorShape({
                                config,
                                ctx: ctxManager.valueOrUndefined(),
                                error,
                                input: call.result(),
                                path: call.path,
                                type: call.procedure?._def.type ?? 'unknown'
                            })
                        };
                    }
                    /**
           * Not very pretty, but we need to wrap nested data in promises
           * Our stream producer will only resolve top-level async values or async values that are directly nested in another async value
           */ const iterable = observable.isObservable(result.data) ? observable.observableToAsyncIterable(result.data, opts.req.signal) : Promise.resolve(result.data);
                    return {
                        result: Promise.resolve({
                            data: iterable
                        })
                    };
                }),
                serialize: config.transformer.output.serialize,
                onError: (cause)=>{
                    opts.onError?.({
                        error: TRPCError.getTRPCErrorFromUnknown(cause),
                        path: undefined,
                        input: undefined,
                        ctx: ctxManager.valueOrUndefined(),
                        req: opts.req,
                        type: info?.type ?? 'unknown'
                    });
                },
                formatError (errorOpts) {
                    const call = info?.calls[errorOpts.path[0]];
                    const error = TRPCError.getTRPCErrorFromUnknown(errorOpts.error);
                    const input = call?.result();
                    const path = call?.path;
                    const type = call?.procedure?._def.type ?? 'unknown';
                    // no need to call `onError` here as it will be propagated through the stream itself
                    const shape = getErrorShape.getErrorShape({
                        config,
                        ctx: ctxManager.valueOrUndefined(),
                        error,
                        input,
                        path,
                        type
                    });
                    return shape;
                }
            });
            return new Response(stream, {
                headers,
                status: headResponse.status
            });
        }
        // httpBatchLink
        /**
     * Non-streaming response:
     * - await all responses in parallel, blocking on the slowest one
     * - create headers with known response body
     * - return a complete HTTPResponse
     */ headers.set('content-type', 'application/json');
        const results = (await Promise.all(rpcCalls)).map((res)=>{
            const [error, result] = res;
            if (error) {
                return res;
            }
            if (isDataStream(result.data)) {
                return [
                    new TRPCError.TRPCError({
                        code: 'UNSUPPORTED_MEDIA_TYPE',
                        message: 'Cannot use stream-like response in non-streaming request - use httpBatchStreamLink'
                    }),
                    undefined
                ];
            }
            return res;
        });
        const resultAsRPCResponse = results.map(([error, result], index)=>{
            const call = info.calls[index];
            if (error) {
                return {
                    error: getErrorShape.getErrorShape({
                        config,
                        ctx: ctxManager.valueOrUndefined(),
                        error,
                        input: call.result(),
                        path: call.path,
                        type: call.procedure?._def.type ?? 'unknown'
                    })
                };
            }
            return {
                result: {
                    data: result.data
                }
            };
        });
        const errors = results.map(([error])=>error).filter(Boolean);
        const headResponse = initResponse({
            ctx: ctxManager.valueOrUndefined(),
            info,
            responseMeta: opts.responseMeta,
            untransformedJSON: resultAsRPCResponse,
            errors,
            headers
        });
        return new Response(JSON.stringify(transformer.transformTRPCResponse(config, resultAsRPCResponse)), {
            status: headResponse.status,
            headers
        });
    } catch (cause) {
        const [_infoError, info] = infoTuple;
        const ctx = ctxManager.valueOrUndefined();
        // we get here if
        // - batching is called when it's not enabled
        // - `createContext()` throws
        // - `router._def._config.transformer.output.serialize()` throws
        // - post body is too large
        // - input deserialization fails
        // - `errorFormatter` return value is malformed
        const { error, untransformedJSON, body } = caughtErrorToData(cause, {
            opts,
            ctx: ctxManager.valueOrUndefined(),
            type: info?.type ?? 'unknown'
        });
        const headResponse = initResponse({
            ctx,
            info,
            responseMeta: opts.responseMeta,
            untransformedJSON,
            errors: [
                error
            ],
            headers
        });
        return new Response(body, {
            status: headResponse.status,
            headers
        });
    }
}

exports.resolveResponse = resolveResponse;
