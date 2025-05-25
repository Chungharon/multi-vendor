'use strict';

var unpromise = require('../../vendor/unpromise/unpromise.js');
var TRPCError = require('../error/TRPCError.js');
var abortError = require('../http/abortError.js');
var utils = require('../utils.js');
var tracked = require('./tracked.js');
var asyncIterable = require('./utils/asyncIterable.js');
var disposable = require('./utils/disposable.js');
var readableStreamFrom = require('./utils/readableStreamFrom.js');
var timerResource = require('./utils/timerResource.js');
var withPing = require('./utils/withPing.js');

function _ts_add_disposable_resource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) {
        env.stack.push({
            async: true
        });
    }
    return value;
}
function _ts_dispose_resources(env) {
    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    return (_ts_dispose_resources = function _ts_dispose_resources(env) {
        function fail(e) {
            env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while(r = env.stack.pop()){
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                            fail(e);
                            return next();
                        });
                    } else s |= 1;
                } catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    })(env);
}
const PING_EVENT = 'ping';
const SERIALIZED_ERROR_EVENT = 'serialized-error';
const CONNECTED_EVENT = 'connected';
const RETURN_EVENT = 'return';
/**
 *
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */ function sseStreamProducer(opts) {
    const { serialize = utils.identity } = opts;
    const ping = {
        enabled: opts.ping?.enabled ?? false,
        intervalMs: opts.ping?.intervalMs ?? 1000
    };
    const client = opts.client ?? {};
    if (ping.enabled && client.reconnectAfterInactivityMs && ping.intervalMs > client.reconnectAfterInactivityMs) {
        throw new Error(`Ping interval must be less than client reconnect interval to prevent unnecessary reconnection - ping.intervalMs: ${ping.intervalMs} client.reconnectAfterInactivityMs: ${client.reconnectAfterInactivityMs}`);
    }
    async function* generator() {
        yield {
            event: CONNECTED_EVENT,
            data: JSON.stringify(client)
        };
        let iterable = opts.data;
        if (opts.emitAndEndImmediately) {
            iterable = asyncIterable.takeWithGrace(iterable, {
                count: 1,
                gracePeriodMs: 1
            });
        }
        if (opts.maxDurationMs && opts.maxDurationMs > 0 && opts.maxDurationMs !== Infinity) {
            iterable = asyncIterable.withMaxDuration(iterable, {
                maxDurationMs: opts.maxDurationMs
            });
        }
        if (ping.enabled && ping.intervalMs !== Infinity && ping.intervalMs > 0) {
            iterable = withPing.withPing(iterable, ping.intervalMs);
        }
        // We need those declarations outside the loop for garbage collection reasons. If they were
        // declared inside, they would not be freed until the next value is present.
        let value;
        let chunk;
        for await (value of iterable){
            if (value === withPing.PING_SYM) {
                yield {
                    event: PING_EVENT,
                    data: ''
                };
                continue;
            }
            chunk = tracked.isTrackedEnvelope(value) ? {
                id: value[0],
                data: value[1]
            } : {
                data: value
            };
            chunk.data = JSON.stringify(serialize(chunk.data));
            yield chunk;
            // free up references for garbage collection
            value = null;
            chunk = null;
        }
    }
    async function* generatorWithErrorHandling() {
        try {
            yield* generator();
            yield {
                event: RETURN_EVENT,
                data: ''
            };
        } catch (cause) {
            if (abortError.isAbortError(cause)) {
                // ignore abort errors, send any other errors
                return;
            }
            // `err` must be caused by `opts.data`, `JSON.stringify` or `serialize`.
            // So, a user error in any case.
            const error = TRPCError.getTRPCErrorFromUnknown(cause);
            const data = opts.formatError?.({
                error
            }) ?? null;
            yield {
                event: SERIALIZED_ERROR_EVENT,
                data: JSON.stringify(serialize(data))
            };
        }
    }
    const stream = readableStreamFrom.readableStreamFrom(generatorWithErrorHandling());
    return stream.pipeThrough(new TransformStream({
        transform (chunk, controller) {
            if ('event' in chunk) {
                controller.enqueue(`event: ${chunk.event}\n`);
            }
            if ('data' in chunk) {
                controller.enqueue(`data: ${chunk.data}\n`);
            }
            if ('id' in chunk) {
                controller.enqueue(`id: ${chunk.id}\n`);
            }
            if ('comment' in chunk) {
                controller.enqueue(`: ${chunk.comment}\n`);
            }
            controller.enqueue('\n\n');
        }
    })).pipeThrough(new TextEncoderStream());
}
async function withTimeout(opts) {
    const env = {
        stack: [],
        error: void 0,
        hasError: false
    };
    try {
        const timeoutPromise = _ts_add_disposable_resource(env, timerResource.timerResource(opts.timeoutMs), false);
        ;
        const res = await unpromise.Unpromise.race([
            opts.promise,
            timeoutPromise.start()
        ]);
        if (res === timerResource.disposablePromiseTimerResult) {
            return await opts.onTimeout();
        }
        return res;
    } catch (e) {
        env.error = e;
        env.hasError = true;
    } finally{
        _ts_dispose_resources(env);
    }
}
/**
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */ function sseStreamConsumer(opts) {
    const { deserialize = (v)=>v } = opts;
    let clientOptions = {};
    const signal = opts.signal;
    let _es = null;
    const createStream = ()=>new ReadableStream({
            async start (controller) {
                const [url, init] = await Promise.all([
                    opts.url(),
                    opts.init()
                ]);
                const eventSource = _es = new opts.EventSource(url, init);
                controller.enqueue({
                    type: 'connecting',
                    eventSource: _es,
                    event: null
                });
                eventSource.addEventListener(CONNECTED_EVENT, (_msg)=>{
                    const msg = _msg;
                    const options = JSON.parse(msg.data);
                    clientOptions = options;
                    controller.enqueue({
                        type: 'connected',
                        options,
                        eventSource
                    });
                });
                eventSource.addEventListener(SERIALIZED_ERROR_EVENT, (_msg)=>{
                    const msg = _msg;
                    controller.enqueue({
                        type: 'serialized-error',
                        error: deserialize(JSON.parse(msg.data)),
                        eventSource
                    });
                });
                eventSource.addEventListener(PING_EVENT, ()=>{
                    controller.enqueue({
                        type: 'ping',
                        eventSource
                    });
                });
                eventSource.addEventListener(RETURN_EVENT, ()=>{
                    eventSource.close();
                    controller.close();
                    _es = null;
                });
                eventSource.addEventListener('error', (event)=>{
                    if (eventSource.readyState === EventSource.CLOSED) {
                        controller.error(event);
                    } else {
                        controller.enqueue({
                            type: 'connecting',
                            eventSource,
                            event
                        });
                    }
                });
                eventSource.addEventListener('message', (_msg)=>{
                    const msg = _msg;
                    const chunk = deserialize(JSON.parse(msg.data));
                    const def = {
                        data: chunk
                    };
                    if (msg.lastEventId) {
                        def.id = msg.lastEventId;
                    }
                    controller.enqueue({
                        type: 'data',
                        data: def,
                        eventSource
                    });
                });
                const onAbort = ()=>{
                    try {
                        eventSource.close();
                        controller.close();
                    } catch  {
                    // ignore errors in case the controller is already closed
                    }
                };
                if (signal.aborted) {
                    onAbort();
                } else {
                    signal.addEventListener('abort', onAbort);
                }
            },
            cancel () {
                _es?.close();
            }
        });
    const getStreamResource = ()=>{
        let stream = createStream();
        let reader = stream.getReader();
        async function dispose() {
            await reader.cancel();
            _es = null;
        }
        return disposable.makeAsyncResource({
            read () {
                return reader.read();
            },
            async recreate () {
                await dispose();
                stream = createStream();
                reader = stream.getReader();
            }
        }, dispose);
    };
    return utils.run(async function*() {
        const env = {
            stack: [],
            error: void 0,
            hasError: false
        };
        try {
            const stream = _ts_add_disposable_resource(env, getStreamResource(), true);
            ;
            while(true){
                let promise = stream.read();
                const timeoutMs = clientOptions.reconnectAfterInactivityMs;
                if (timeoutMs) {
                    promise = withTimeout({
                        promise,
                        timeoutMs,
                        onTimeout: async ()=>{
                            const res = {
                                value: {
                                    type: 'timeout',
                                    ms: timeoutMs,
                                    eventSource: _es
                                },
                                done: false
                            };
                            // Close and release old reader
                            await stream.recreate();
                            return res;
                        }
                    });
                }
                const result = await promise;
                if (result.done) {
                    return result.value;
                }
                yield result.value;
            }
        } catch (e) {
            env.error = e;
            env.hasError = true;
        } finally{
            const result = _ts_dispose_resources(env);
            if (result) await result;
        }
    });
}
const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
    Connection: 'keep-alive'
};

exports.sseHeaders = sseHeaders;
exports.sseStreamConsumer = sseStreamConsumer;
exports.sseStreamProducer = sseStreamProducer;
