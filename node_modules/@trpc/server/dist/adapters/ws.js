'use strict';

var getErrorShape = require('../unstable-core-do-not-import/error/getErrorShape.js');
var TRPCError = require('../unstable-core-do-not-import/error/TRPCError.js');
var router = require('../unstable-core-do-not-import/router.js');
var utils = require('../unstable-core-do-not-import/utils.js');
var parseConnectionParams = require('../unstable-core-do-not-import/http/parseConnectionParams.js');
var parseTRPCMessage = require('../unstable-core-do-not-import/rpc/parseTRPCMessage.js');
var observable = require('../observable/observable.js');
var asyncIterable = require('../unstable-core-do-not-import/stream/utils/asyncIterable.js');
require('../unstable-core-do-not-import/stream/utils/disposable.js');
var unpromise = require('../vendor/unpromise/unpromise.js');
var tracked = require('../unstable-core-do-not-import/stream/tracked.js');
var transformer = require('../unstable-core-do-not-import/transformer.js');
require('../unstable-core-do-not-import/rootConfig.js');
var incomingMessageToRequest = require('./node-http/incomingMessageToRequest.js');

function _ts_add_disposable_resource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            inner = dispose;
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
    } else {
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
/**
 * Importing ws causes a build error
 * @see https://github.com/trpc/trpc/pull/5279
 */ const WEBSOCKET_OPEN = 1; /* ws.WebSocket.OPEN */ 
function getWSConnectionHandler(opts) {
    const { createContext, router: router$1 } = opts;
    const { transformer: transformer$1 } = router$1._def._config;
    return (client, req)=>{
        const clientSubscriptions = new Map();
        const abortController = new AbortController();
        if (opts.keepAlive?.enabled) {
            const { pingMs, pongWaitMs } = opts.keepAlive;
            handleKeepAlive(client, pingMs, pongWaitMs);
        }
        function respond(untransformedJSON) {
            client.send(JSON.stringify(transformer.transformTRPCResponse(router$1._def._config, untransformedJSON)));
        }
        async function createCtxPromise(getConnectionParams) {
            try {
                return await utils.run(async ()=>{
                    ctx = await createContext?.({
                        req,
                        res: client,
                        info: {
                            connectionParams: getConnectionParams(),
                            calls: [],
                            isBatchCall: false,
                            accept: null,
                            type: 'unknown',
                            signal: abortController.signal,
                            url: null
                        }
                    });
                    return {
                        ok: true,
                        value: ctx
                    };
                });
            } catch (cause) {
                const error = TRPCError.getTRPCErrorFromUnknown(cause);
                opts.onError?.({
                    error,
                    path: undefined,
                    type: 'unknown',
                    ctx,
                    req,
                    input: undefined
                });
                respond({
                    id: null,
                    error: getErrorShape.getErrorShape({
                        config: router$1._def._config,
                        error,
                        type: 'unknown',
                        path: undefined,
                        input: undefined,
                        ctx
                    })
                });
                // close in next tick
                (globalThis.setImmediate ?? globalThis.setTimeout)(()=>{
                    client.close();
                });
                return {
                    ok: false,
                    error
                };
            }
        }
        let ctx = undefined;
        /**
     * promise for initializing the context
     *
     * - the context promise will be created immediately on connection if no connectionParams are expected
     * - if connection params are expected, they will be created once received
     */ let ctxPromise = incomingMessageToRequest.createURL(req).searchParams.get('connectionParams') === '1' ? null : createCtxPromise(()=>null);
        function handleRequest(msg) {
            const { id, jsonrpc } = msg;
            if (id === null) {
                const error = TRPCError.getTRPCErrorFromUnknown(new TRPCError.TRPCError({
                    code: 'PARSE_ERROR',
                    message: '`id` is required'
                }));
                opts.onError?.({
                    error,
                    path: undefined,
                    type: 'unknown',
                    ctx,
                    req,
                    input: undefined
                });
                respond({
                    id,
                    jsonrpc,
                    error: getErrorShape.getErrorShape({
                        config: router$1._def._config,
                        error,
                        type: 'unknown',
                        path: undefined,
                        input: undefined,
                        ctx
                    })
                });
                return;
            }
            if (msg.method === 'subscription.stop') {
                clientSubscriptions.get(id)?.abort();
                return;
            }
            const { path, lastEventId } = msg.params;
            let { input } = msg.params;
            const type = msg.method;
            if (lastEventId !== undefined) {
                if (utils.isObject(input)) {
                    input = {
                        ...input,
                        lastEventId: lastEventId
                    };
                } else {
                    input ?? (input = {
                        lastEventId: lastEventId
                    });
                }
            }
            utils.run(async ()=>{
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const res = await ctxPromise; // asserts context has been set
                if (!res.ok) {
                    throw res.error;
                }
                const abortController = new AbortController();
                const result = await router.callProcedure({
                    router: router$1,
                    path,
                    getRawInput: async ()=>input,
                    ctx,
                    type,
                    signal: abortController.signal
                });
                const isIterableResult = utils.isAsyncIterable(result) || observable.isObservable(result);
                if (type !== 'subscription') {
                    if (isIterableResult) {
                        throw new TRPCError.TRPCError({
                            code: 'UNSUPPORTED_MEDIA_TYPE',
                            message: `Cannot return an async iterable or observable from a ${type} procedure with WebSockets`
                        });
                    }
                    // send the value as data if the method is not a subscription
                    respond({
                        id,
                        jsonrpc,
                        result: {
                            type: 'data',
                            data: result
                        }
                    });
                    return;
                }
                if (!isIterableResult) {
                    throw new TRPCError.TRPCError({
                        message: `Subscription ${path} did not return an observable or a AsyncGenerator`,
                        code: 'INTERNAL_SERVER_ERROR'
                    });
                }
                /* istanbul ignore next -- @preserve */ if (client.readyState !== WEBSOCKET_OPEN) {
                    // if the client got disconnected whilst initializing the subscription
                    // no need to send stopped message if the client is disconnected
                    return;
                }
                /* istanbul ignore next -- @preserve */ if (clientSubscriptions.has(id)) {
                    // duplicate request ids for client
                    throw new TRPCError.TRPCError({
                        message: `Duplicate id ${id}`,
                        code: 'BAD_REQUEST'
                    });
                }
                const iterable = observable.isObservable(result) ? observable.observableToAsyncIterable(result, abortController.signal) : result;
                utils.run(async ()=>{
                    const env = {
                        stack: [],
                        error: void 0,
                        hasError: false
                    };
                    try {
                        const iterator = _ts_add_disposable_resource(env, asyncIterable.iteratorResource(iterable), true);
                        ;
                        const abortPromise = new Promise((resolve)=>{
                            abortController.signal.onabort = ()=>resolve('abort');
                        });
                        // We need those declarations outside the loop for garbage collection reasons. If they
                        // were declared inside, they would not be freed until the next value is present.
                        let next;
                        let result;
                        while(true){
                            next = await unpromise.Unpromise.race([
                                iterator.next().catch(TRPCError.getTRPCErrorFromUnknown),
                                abortPromise
                            ]);
                            if (next === 'abort') {
                                await iterator.return?.();
                                break;
                            }
                            if (next instanceof Error) {
                                const error = TRPCError.getTRPCErrorFromUnknown(next);
                                opts.onError?.({
                                    error,
                                    path,
                                    type,
                                    ctx,
                                    req,
                                    input
                                });
                                respond({
                                    id,
                                    jsonrpc,
                                    error: getErrorShape.getErrorShape({
                                        config: router$1._def._config,
                                        error,
                                        type,
                                        path,
                                        input,
                                        ctx
                                    })
                                });
                                break;
                            }
                            if (next.done) {
                                break;
                            }
                            result = {
                                type: 'data',
                                data: next.value
                            };
                            if (tracked.isTrackedEnvelope(next.value)) {
                                const [id, data] = next.value;
                                result.id = id;
                                result.data = {
                                    id,
                                    data
                                };
                            }
                            respond({
                                id,
                                jsonrpc,
                                result
                            });
                            // free up references for garbage collection
                            next = null;
                            result = null;
                        }
                        respond({
                            id,
                            jsonrpc,
                            result: {
                                type: 'stopped'
                            }
                        });
                        clientSubscriptions.delete(id);
                    } catch (e) {
                        env.error = e;
                        env.hasError = true;
                    } finally{
                        const result = _ts_dispose_resources(env);
                        if (result) await result;
                    }
                }).catch((cause)=>{
                    const error = TRPCError.getTRPCErrorFromUnknown(cause);
                    opts.onError?.({
                        error,
                        path,
                        type,
                        ctx,
                        req,
                        input
                    });
                    respond({
                        id,
                        jsonrpc,
                        error: getErrorShape.getErrorShape({
                            config: router$1._def._config,
                            error,
                            type,
                            path,
                            input,
                            ctx
                        })
                    });
                    abortController.abort();
                });
                clientSubscriptions.set(id, abortController);
                respond({
                    id,
                    jsonrpc,
                    result: {
                        type: 'started'
                    }
                });
            }).catch((cause)=>{
                // procedure threw an error
                const error = TRPCError.getTRPCErrorFromUnknown(cause);
                opts.onError?.({
                    error,
                    path,
                    type,
                    ctx,
                    req,
                    input
                });
                respond({
                    id,
                    jsonrpc,
                    error: getErrorShape.getErrorShape({
                        config: router$1._def._config,
                        error,
                        type,
                        path,
                        input,
                        ctx
                    })
                });
            });
        }
        client.on('message', (rawData)=>{
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            const msgStr = rawData.toString();
            if (msgStr === 'PONG') {
                return;
            }
            if (msgStr === 'PING') {
                if (!opts.dangerouslyDisablePong) {
                    client.send('PONG');
                }
                return;
            }
            if (!ctxPromise) {
                // If the ctxPromise wasn't created immediately, we're expecting the first message to be a TRPCConnectionParamsMessage
                ctxPromise = createCtxPromise(()=>{
                    let msg;
                    try {
                        msg = JSON.parse(msgStr);
                        if (!utils.isObject(msg)) {
                            throw new Error('Message was not an object');
                        }
                    } catch (cause) {
                        throw new TRPCError.TRPCError({
                            code: 'PARSE_ERROR',
                            message: `Malformed TRPCConnectionParamsMessage`,
                            cause
                        });
                    }
                    const connectionParams = parseConnectionParams.parseConnectionParamsFromUnknown(msg.data);
                    return connectionParams;
                });
                return;
            }
            const parsedMsgs = utils.run(()=>{
                try {
                    const msgJSON = JSON.parse(msgStr);
                    const msgs = Array.isArray(msgJSON) ? msgJSON : [
                        msgJSON
                    ];
                    return msgs.map((raw)=>parseTRPCMessage.parseTRPCMessage(raw, transformer$1));
                } catch (cause) {
                    const error = new TRPCError.TRPCError({
                        code: 'PARSE_ERROR',
                        cause
                    });
                    respond({
                        id: null,
                        error: getErrorShape.getErrorShape({
                            config: router$1._def._config,
                            error,
                            type: 'unknown',
                            path: undefined,
                            input: undefined,
                            ctx
                        })
                    });
                    return [];
                }
            });
            parsedMsgs.map(handleRequest);
        });
        // WebSocket errors should be handled, as otherwise unhandled exceptions will crash Node.js.
        // This line was introduced after the following error brought down production systems:
        // "RangeError: Invalid WebSocket frame: RSV2 and RSV3 must be clear"
        // Here is the relevant discussion: https://github.com/websockets/ws/issues/1354#issuecomment-774616962
        client.on('error', (cause)=>{
            opts.onError?.({
                ctx,
                error: TRPCError.getTRPCErrorFromUnknown(cause),
                input: undefined,
                path: undefined,
                type: 'unknown',
                req
            });
        });
        client.once('close', ()=>{
            for (const sub of clientSubscriptions.values()){
                sub.abort();
            }
            clientSubscriptions.clear();
            abortController.abort();
        });
    };
}
/**
 * Handle WebSocket keep-alive messages
 */ function handleKeepAlive(client, pingMs = 30000, pongWaitMs = 5000) {
    let timeout = undefined;
    let ping = undefined;
    const schedulePing = ()=>{
        const scheduleTimeout = ()=>{
            timeout = setTimeout(()=>{
                client.terminate();
            }, pongWaitMs);
        };
        ping = setTimeout(()=>{
            client.send('PING');
            scheduleTimeout();
        }, pingMs);
    };
    const onMessage = ()=>{
        clearTimeout(ping);
        clearTimeout(timeout);
        schedulePing();
    };
    client.on('message', onMessage);
    client.on('close', ()=>{
        clearTimeout(ping);
        clearTimeout(timeout);
    });
    schedulePing();
}
function applyWSSHandler(opts) {
    const onConnection = getWSConnectionHandler(opts);
    opts.wss.on('connection', (client, req)=>{
        if (opts.prefix && !req.url?.startsWith(opts.prefix)) {
            return;
        }
        onConnection(client, req);
    });
    return {
        broadcastReconnectNotification: ()=>{
            const response = {
                id: null,
                method: 'reconnect'
            };
            const data = JSON.stringify(response);
            for (const client of opts.wss.clients){
                if (client.readyState === WEBSOCKET_OPEN) {
                    client.send(data);
                }
            }
        }
    };
}

exports.applyWSSHandler = applyWSSHandler;
exports.getWSConnectionHandler = getWSConnectionHandler;
exports.handleKeepAlive = handleKeepAlive;
