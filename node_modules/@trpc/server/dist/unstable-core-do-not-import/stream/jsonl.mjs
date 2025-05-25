import { isObject, isFunction, run, isAsyncIterable } from '../utils.mjs';
import { iteratorResource } from './utils/asyncIterable.mjs';
import { createDeferred } from './utils/createDeferred.mjs';
import { makeResource } from './utils/disposable.mjs';
import { mergeAsyncIterables } from './utils/mergeAsyncIterables.mjs';
import { readableStreamFrom } from './utils/readableStreamFrom.mjs';
import { PING_SYM, withPing } from './utils/withPing.mjs';

function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
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
function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
// ---------- types
const CHUNK_VALUE_TYPE_PROMISE = 0;
const CHUNK_VALUE_TYPE_ASYNC_ITERABLE = 1;
const PROMISE_STATUS_FULFILLED = 0;
const PROMISE_STATUS_REJECTED = 1;
const ASYNC_ITERABLE_STATUS_RETURN = 0;
const ASYNC_ITERABLE_STATUS_YIELD = 1;
const ASYNC_ITERABLE_STATUS_ERROR = 2;
function isPromise(value) {
    return (isObject(value) || isFunction(value)) && typeof value?.['then'] === 'function' && typeof value?.['catch'] === 'function';
}
class MaxDepthError extends Error {
    constructor(path){
        super('Max depth reached at path: ' + path.join('.')), _define_property(this, "path", void 0), this.path = path;
    }
}
async function* createBatchStreamProducer(opts) {
    const { data } = opts;
    let counter = 0;
    const placeholder = 0;
    const mergedIterables = mergeAsyncIterables();
    function registerAsync(callback) {
        const idx = counter++;
        const iterable = callback(idx);
        mergedIterables.add(iterable);
        return idx;
    }
    function encodePromise(promise, path) {
        return registerAsync(async function*(idx) {
            const error = checkMaxDepth(path);
            if (error) {
                // Catch any errors from the original promise to ensure they're reported
                promise.catch((cause)=>{
                    opts.onError?.({
                        error: cause,
                        path
                    });
                });
                // Replace the promise with a rejected one containing the max depth error
                promise = Promise.reject(error);
            }
            try {
                const next = await promise;
                yield [
                    idx,
                    PROMISE_STATUS_FULFILLED,
                    encode(next, path)
                ];
            } catch (cause) {
                opts.onError?.({
                    error: cause,
                    path
                });
                yield [
                    idx,
                    PROMISE_STATUS_REJECTED,
                    opts.formatError?.({
                        error: cause,
                        path
                    })
                ];
            }
        });
    }
    function encodeAsyncIterable(iterable, path) {
        return registerAsync(async function*(idx) {
            const env = {
                stack: [],
                error: void 0,
                hasError: false
            };
            try {
                const error = checkMaxDepth(path);
                if (error) {
                    throw error;
                }
                const iterator = _ts_add_disposable_resource(env, iteratorResource(iterable), true);
                ;
                try {
                    while(true){
                        const next = await iterator.next();
                        if (next.done) {
                            yield [
                                idx,
                                ASYNC_ITERABLE_STATUS_RETURN,
                                encode(next.value, path)
                            ];
                            break;
                        }
                        yield [
                            idx,
                            ASYNC_ITERABLE_STATUS_YIELD,
                            encode(next.value, path)
                        ];
                    }
                } catch (cause) {
                    opts.onError?.({
                        error: cause,
                        path
                    });
                    yield [
                        idx,
                        ASYNC_ITERABLE_STATUS_ERROR,
                        opts.formatError?.({
                            error: cause,
                            path
                        })
                    ];
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
    function checkMaxDepth(path) {
        if (opts.maxDepth && path.length > opts.maxDepth) {
            return new MaxDepthError(path);
        }
        return null;
    }
    function encodeAsync(value, path) {
        if (isPromise(value)) {
            return [
                CHUNK_VALUE_TYPE_PROMISE,
                encodePromise(value, path)
            ];
        }
        if (isAsyncIterable(value)) {
            if (opts.maxDepth && path.length >= opts.maxDepth) {
                throw new Error('Max depth reached');
            }
            return [
                CHUNK_VALUE_TYPE_ASYNC_ITERABLE,
                encodeAsyncIterable(value, path)
            ];
        }
        return null;
    }
    function encode(value, path) {
        if (value === undefined) {
            return [
                []
            ];
        }
        const reg = encodeAsync(value, path);
        if (reg) {
            return [
                [
                    placeholder
                ],
                [
                    null,
                    ...reg
                ]
            ];
        }
        if (!isPlainObject(value)) {
            return [
                [
                    value
                ]
            ];
        }
        const newObj = {};
        const asyncValues = [];
        for (const [key, item] of Object.entries(value)){
            const transformed = encodeAsync(item, [
                ...path,
                key
            ]);
            if (!transformed) {
                newObj[key] = item;
                continue;
            }
            newObj[key] = placeholder;
            asyncValues.push([
                key,
                ...transformed
            ]);
        }
        return [
            [
                newObj
            ],
            ...asyncValues
        ];
    }
    const newHead = {};
    for (const [key, item] of Object.entries(data)){
        newHead[key] = encode(item, [
            key
        ]);
    }
    yield newHead;
    let iterable = mergedIterables;
    if (opts.pingMs) {
        iterable = withPing(mergedIterables, opts.pingMs);
    }
    for await (const value of iterable){
        yield value;
    }
}
/**
 * JSON Lines stream producer
 * @see https://jsonlines.org/
 */ function jsonlStreamProducer(opts) {
    let stream = readableStreamFrom(createBatchStreamProducer(opts));
    const { serialize } = opts;
    if (serialize) {
        stream = stream.pipeThrough(new TransformStream({
            transform (chunk, controller) {
                if (chunk === PING_SYM) {
                    controller.enqueue(PING_SYM);
                } else {
                    controller.enqueue(serialize(chunk));
                }
            }
        }));
    }
    return stream.pipeThrough(new TransformStream({
        transform (chunk, controller) {
            if (chunk === PING_SYM) {
                controller.enqueue(' ');
            } else {
                controller.enqueue(JSON.stringify(chunk) + '\n');
            }
        }
    })).pipeThrough(new TextEncoderStream());
}
class AsyncError extends Error {
    constructor(data){
        super('Received error from server'), _define_property(this, "data", void 0), this.data = data;
    }
}
const nodeJsStreamToReaderEsque = (source)=>{
    return {
        getReader () {
            const stream = new ReadableStream({
                start (controller) {
                    source.on('data', (chunk)=>{
                        controller.enqueue(chunk);
                    });
                    source.on('end', ()=>{
                        controller.close();
                    });
                    source.on('error', (error)=>{
                        controller.error(error);
                    });
                }
            });
            return stream.getReader();
        }
    };
};
function createLineAccumulator(from) {
    const reader = 'getReader' in from ? from.getReader() : nodeJsStreamToReaderEsque(from).getReader();
    let lineAggregate = '';
    return new ReadableStream({
        async pull (controller) {
            const { done, value } = await reader.read();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
        cancel () {
            return reader.cancel();
        }
    }).pipeThrough(new TextDecoderStream()).pipeThrough(new TransformStream({
        transform (chunk, controller) {
            lineAggregate += chunk;
            const parts = lineAggregate.split('\n');
            lineAggregate = parts.pop() ?? '';
            for (const part of parts){
                controller.enqueue(part);
            }
        }
    }));
}
function createConsumerStream(from) {
    const stream = createLineAccumulator(from);
    let sentHead = false;
    return stream.pipeThrough(new TransformStream({
        transform (line, controller) {
            if (!sentHead) {
                const head = JSON.parse(line);
                controller.enqueue(head);
                sentHead = true;
            } else {
                const chunk = JSON.parse(line);
                controller.enqueue(chunk);
            }
        }
    }));
}
/**
 * Creates a handler for managing stream controllers and their lifecycle
 */ function createStreamsManager(abortController) {
    const controllerMap = new Map();
    /**
   * Checks if there are no pending controllers or deferred promises
   */ function isEmpty() {
        return Array.from(controllerMap.values()).every((c)=>c.closed);
    }
    /**
   * Creates a stream controller
   */ function createStreamController() {
        let originalController;
        const stream = new ReadableStream({
            start (controller) {
                originalController = controller;
            }
        });
        const streamController = {
            enqueue: (v)=>originalController.enqueue(v),
            close: ()=>{
                originalController.close();
                clear();
                if (isEmpty()) {
                    abortController.abort();
                }
            },
            closed: false,
            getReaderResource: ()=>{
                const reader = stream.getReader();
                return makeResource(reader, ()=>{
                    reader.releaseLock();
                    streamController.close();
                });
            },
            error: (reason)=>{
                originalController.error(reason);
                clear();
            }
        };
        function clear() {
            Object.assign(streamController, {
                closed: true,
                close: ()=>{
                // noop
                },
                enqueue: ()=>{
                // noop
                },
                getReaderResource: null,
                error: ()=>{
                // noop
                }
            });
        }
        return streamController;
    }
    /**
   * Gets or creates a stream controller
   */ function getOrCreate(chunkId) {
        let c = controllerMap.get(chunkId);
        if (!c) {
            c = createStreamController();
            controllerMap.set(chunkId, c);
        }
        return c;
    }
    /**
   * Cancels all pending controllers and rejects deferred promises
   */ function cancelAll(reason) {
        for (const controller of controllerMap.values()){
            controller.error(reason);
        }
    }
    return {
        getOrCreate,
        isEmpty,
        cancelAll
    };
}
/**
 * JSON Lines stream consumer
 * @see https://jsonlines.org/
 */ async function jsonlStreamConsumer(opts) {
    const { deserialize = (v)=>v } = opts;
    let source = createConsumerStream(opts.from);
    if (deserialize) {
        source = source.pipeThrough(new TransformStream({
            transform (chunk, controller) {
                controller.enqueue(deserialize(chunk));
            }
        }));
    }
    let headDeferred = createDeferred();
    const streamManager = createStreamsManager(opts.abortController);
    function decodeChunkDefinition(value) {
        const [_path, type, chunkId] = value;
        const controller = streamManager.getOrCreate(chunkId);
        switch(type){
            case CHUNK_VALUE_TYPE_PROMISE:
                {
                    return run(async ()=>{
                        const env = {
                            stack: [],
                            error: void 0,
                            hasError: false
                        };
                        try {
                            const reader = _ts_add_disposable_resource(env, controller.getReaderResource(), false);
                            ;
                            const { value } = await reader.read();
                            const [_chunkId, status, data] = value;
                            switch(status){
                                case PROMISE_STATUS_FULFILLED:
                                    return decode(data);
                                case PROMISE_STATUS_REJECTED:
                                    throw opts.formatError?.({
                                        error: data
                                    }) ?? new AsyncError(data);
                            }
                        } catch (e) {
                            env.error = e;
                            env.hasError = true;
                        } finally{
                            _ts_dispose_resources(env);
                        }
                    });
                }
            case CHUNK_VALUE_TYPE_ASYNC_ITERABLE:
                {
                    return run(async function*() {
                        const env = {
                            stack: [],
                            error: void 0,
                            hasError: false
                        };
                        try {
                            const reader = _ts_add_disposable_resource(env, controller.getReaderResource(), false);
                            ;
                            while(true){
                                const { value } = await reader.read();
                                const [_chunkId, status, data] = value;
                                switch(status){
                                    case ASYNC_ITERABLE_STATUS_YIELD:
                                        yield decode(data);
                                        break;
                                    case ASYNC_ITERABLE_STATUS_RETURN:
                                        return decode(data);
                                    case ASYNC_ITERABLE_STATUS_ERROR:
                                        throw opts.formatError?.({
                                            error: data
                                        }) ?? new AsyncError(data);
                                }
                            }
                        } catch (e) {
                            env.error = e;
                            env.hasError = true;
                        } finally{
                            _ts_dispose_resources(env);
                        }
                    });
                }
        }
    }
    function decode(value) {
        const [[data], ...asyncProps] = value;
        for (const value of asyncProps){
            const [key] = value;
            const decoded = decodeChunkDefinition(value);
            if (key === null) {
                return decoded;
            }
            data[key] = decoded;
        }
        return data;
    }
    const closeOrAbort = (reason)=>{
        headDeferred?.reject(reason);
        streamManager.cancelAll(reason);
    };
    source.pipeTo(new WritableStream({
        write (chunkOrHead) {
            if (headDeferred) {
                const head = chunkOrHead;
                for (const [key, value] of Object.entries(chunkOrHead)){
                    const parsed = decode(value);
                    head[key] = parsed;
                }
                headDeferred.resolve(head);
                headDeferred = null;
                return;
            }
            const chunk = chunkOrHead;
            const [idx] = chunk;
            const controller = streamManager.getOrCreate(idx);
            controller.enqueue(chunk);
        },
        close: ()=>closeOrAbort(new Error('Stream closed')),
        abort: closeOrAbort
    }), {
        signal: opts.abortController.signal
    }).catch((error)=>{
        opts.onError?.({
            error
        });
        closeOrAbort(error);
    });
    return [
        await headDeferred.promise,
        streamManager
    ];
}

export { isPromise, jsonlStreamConsumer, jsonlStreamProducer };
