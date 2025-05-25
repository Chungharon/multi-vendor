'use strict';

var observable = require('@trpc/server/observable');
var rpc = require('@trpc/server/rpc');
var unstableCoreDoNotImport = require('@trpc/server/unstable-core-do-not-import');
var inputWithTrackedEventId = require('../internals/inputWithTrackedEventId.js');
var signals = require('../internals/signals.js');
var TRPCClientError = require('../TRPCClientError.js');
var transformer = require('../internals/transformer.js');
var httpUtils = require('./internals/httpUtils.js');
var urlWithConnectionParams$1 = require('./internals/urlWithConnectionParams.js');

async function urlWithConnectionParams(opts) {
    let url = await urlWithConnectionParams$1.resultOf(opts.url);
    if (opts.connectionParams) {
        const params = await urlWithConnectionParams$1.resultOf(opts.connectionParams);
        const prefix = url.includes('?') ? '&' : '?';
        url += prefix + 'connectionParams=' + encodeURIComponent(JSON.stringify(params));
    }
    return url;
}
/**
 * tRPC error codes that are considered retryable
 * With out of the box SSE, the client will reconnect when these errors are encountered
 */ const codes5xx = [
    rpc.TRPC_ERROR_CODES_BY_KEY.BAD_GATEWAY,
    rpc.TRPC_ERROR_CODES_BY_KEY.SERVICE_UNAVAILABLE,
    rpc.TRPC_ERROR_CODES_BY_KEY.GATEWAY_TIMEOUT,
    rpc.TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR
];
/**
 * @see https://trpc.io/docs/client/links/httpSubscriptionLink
 */ function httpSubscriptionLink(opts) {
    const transformer$1 = transformer.getTransformer(opts.transformer);
    return ()=>{
        return ({ op })=>{
            return observable.observable((observer)=>{
                const { type, path, input } = op;
                /* istanbul ignore if -- @preserve */ if (type !== 'subscription') {
                    throw new Error('httpSubscriptionLink only supports subscriptions');
                }
                let lastEventId = undefined;
                const ac = new AbortController();
                const signal = signals.raceAbortSignals(op.signal, ac.signal);
                const eventSourceStream = unstableCoreDoNotImport.sseStreamConsumer({
                    url: async ()=>httpUtils.getUrl({
                            transformer: transformer$1,
                            url: await urlWithConnectionParams(opts),
                            input: inputWithTrackedEventId.inputWithTrackedEventId(input, lastEventId),
                            path,
                            type,
                            signal: null
                        }),
                    init: ()=>urlWithConnectionParams$1.resultOf(opts.eventSourceOptions, {
                            op
                        }),
                    signal,
                    deserialize: transformer$1.output.deserialize,
                    EventSource: opts.EventSource ?? globalThis.EventSource
                });
                const connectionState = observable.behaviorSubject({
                    type: 'state',
                    state: 'connecting',
                    error: null
                });
                const connectionSub = connectionState.subscribe({
                    next (state) {
                        observer.next({
                            result: state
                        });
                    }
                });
                unstableCoreDoNotImport.run(async ()=>{
                    for await (const chunk of eventSourceStream){
                        switch(chunk.type){
                            case 'ping':
                                break;
                            case 'data':
                                const chunkData = chunk.data;
                                let result;
                                if (chunkData.id) {
                                    // if the `tracked()`-helper is used, we always have an `id` field
                                    lastEventId = chunkData.id;
                                    result = {
                                        id: chunkData.id,
                                        data: chunkData
                                    };
                                } else {
                                    result = {
                                        data: chunkData.data
                                    };
                                }
                                observer.next({
                                    result,
                                    context: {
                                        eventSource: chunk.eventSource
                                    }
                                });
                                break;
                            case 'connected':
                                {
                                    observer.next({
                                        result: {
                                            type: 'started'
                                        },
                                        context: {
                                            eventSource: chunk.eventSource
                                        }
                                    });
                                    connectionState.next({
                                        type: 'state',
                                        state: 'pending',
                                        error: null
                                    });
                                    break;
                                }
                            case 'serialized-error':
                                {
                                    const error = TRPCClientError.TRPCClientError.from({
                                        error: chunk.error
                                    });
                                    if (codes5xx.includes(chunk.error.code)) {
                                        //
                                        connectionState.next({
                                            type: 'state',
                                            state: 'connecting',
                                            error
                                        });
                                        break;
                                    }
                                    //
                                    // non-retryable error, cancel the subscription
                                    throw error;
                                }
                            case 'connecting':
                                {
                                    const lastState = connectionState.get();
                                    const error = chunk.event && TRPCClientError.TRPCClientError.from(chunk.event);
                                    if (!error && lastState.state === 'connecting') {
                                        break;
                                    }
                                    connectionState.next({
                                        type: 'state',
                                        state: 'connecting',
                                        error
                                    });
                                    break;
                                }
                            case 'timeout':
                                {
                                    connectionState.next({
                                        type: 'state',
                                        state: 'connecting',
                                        error: new TRPCClientError.TRPCClientError(`Timeout of ${chunk.ms}ms reached while waiting for a response`)
                                    });
                                }
                        }
                    }
                    observer.next({
                        result: {
                            type: 'stopped'
                        }
                    });
                    connectionState.next({
                        type: 'state',
                        state: 'idle',
                        error: null
                    });
                    observer.complete();
                }).catch((error)=>{
                    observer.error(TRPCClientError.TRPCClientError.from(error));
                });
                return ()=>{
                    observer.complete();
                    ac.abort();
                    connectionSub.unsubscribe();
                };
            });
        };
    };
}
/**
 * @deprecated use {@link httpSubscriptionLink} instead
 */ const unstable_httpSubscriptionLink = httpSubscriptionLink;

exports.httpSubscriptionLink = httpSubscriptionLink;
exports.unstable_httpSubscriptionLink = unstable_httpSubscriptionLink;
