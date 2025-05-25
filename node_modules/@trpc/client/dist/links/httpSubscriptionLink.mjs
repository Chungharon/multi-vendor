import { observable, behaviorSubject } from '@trpc/server/observable';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc';
import { sseStreamConsumer, run } from '@trpc/server/unstable-core-do-not-import';
import { inputWithTrackedEventId } from '../internals/inputWithTrackedEventId.mjs';
import { raceAbortSignals } from '../internals/signals.mjs';
import { TRPCClientError } from '../TRPCClientError.mjs';
import { getTransformer } from '../internals/transformer.mjs';
import { getUrl } from './internals/httpUtils.mjs';
import { resultOf } from './internals/urlWithConnectionParams.mjs';

async function urlWithConnectionParams(opts) {
    let url = await resultOf(opts.url);
    if (opts.connectionParams) {
        const params = await resultOf(opts.connectionParams);
        const prefix = url.includes('?') ? '&' : '?';
        url += prefix + 'connectionParams=' + encodeURIComponent(JSON.stringify(params));
    }
    return url;
}
/**
 * tRPC error codes that are considered retryable
 * With out of the box SSE, the client will reconnect when these errors are encountered
 */ const codes5xx = [
    TRPC_ERROR_CODES_BY_KEY.BAD_GATEWAY,
    TRPC_ERROR_CODES_BY_KEY.SERVICE_UNAVAILABLE,
    TRPC_ERROR_CODES_BY_KEY.GATEWAY_TIMEOUT,
    TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR
];
/**
 * @see https://trpc.io/docs/client/links/httpSubscriptionLink
 */ function httpSubscriptionLink(opts) {
    const transformer = getTransformer(opts.transformer);
    return ()=>{
        return ({ op })=>{
            return observable((observer)=>{
                const { type, path, input } = op;
                /* istanbul ignore if -- @preserve */ if (type !== 'subscription') {
                    throw new Error('httpSubscriptionLink only supports subscriptions');
                }
                let lastEventId = undefined;
                const ac = new AbortController();
                const signal = raceAbortSignals(op.signal, ac.signal);
                const eventSourceStream = sseStreamConsumer({
                    url: async ()=>getUrl({
                            transformer,
                            url: await urlWithConnectionParams(opts),
                            input: inputWithTrackedEventId(input, lastEventId),
                            path,
                            type,
                            signal: null
                        }),
                    init: ()=>resultOf(opts.eventSourceOptions, {
                            op
                        }),
                    signal,
                    deserialize: transformer.output.deserialize,
                    EventSource: opts.EventSource ?? globalThis.EventSource
                });
                const connectionState = behaviorSubject({
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
                run(async ()=>{
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
                                    const error = TRPCClientError.from({
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
                                    const error = chunk.event && TRPCClientError.from(chunk.event);
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
                                        error: new TRPCClientError(`Timeout of ${chunk.ms}ms reached while waiting for a response`)
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
                    observer.error(TRPCClientError.from(error));
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

export { httpSubscriptionLink, unstable_httpSubscriptionLink };
