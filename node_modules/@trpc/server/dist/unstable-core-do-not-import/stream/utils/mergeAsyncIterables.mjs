import { createDeferred } from './createDeferred.mjs';
import { makeAsyncResource } from './disposable.mjs';

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
function createManagedIterator(iterable, onResult) {
    const iterator = iterable[Symbol.asyncIterator]();
    let state = 'idle';
    function cleanup() {
        state = 'done';
        onResult = ()=>{
        // noop
        };
    }
    function pull() {
        if (state !== 'idle') {
            return;
        }
        state = 'pending';
        const next = iterator.next();
        next.then((result)=>{
            if (result.done) {
                state = 'done';
                onResult({
                    status: 'return',
                    value: result.value
                });
                cleanup();
                return;
            }
            state = 'idle';
            onResult({
                status: 'yield',
                value: result.value
            });
        }).catch((cause)=>{
            onResult({
                status: 'error',
                error: cause
            });
            cleanup();
        });
    }
    return {
        pull,
        destroy: async ()=>{
            cleanup();
            await iterator.return?.();
        }
    };
}
/**
 * Creates a new async iterable that merges multiple async iterables into a single stream.
 * Values from the input iterables are yielded in the order they resolve, similar to Promise.race().
 *
 * New iterables can be added dynamically using the returned {@link MergedAsyncIterables.add} method, even after iteration has started.
 *
 * If any of the input iterables throws an error, that error will be propagated through the merged stream.
 * Other iterables will not continue to be processed.
 *
 * @template TYield The type of values yielded by the input iterables
 */ function mergeAsyncIterables() {
    let state = 'idle';
    let flushSignal = createDeferred();
    /**
   * used while {@link state} is `idle`
   */ const iterables = [];
    /**
   * used while {@link state} is `pending`
   */ const iterators = new Set();
    const buffer = [];
    function initIterable(iterable) {
        if (state !== 'pending') {
            // shouldn't happen
            return;
        }
        const iterator = createManagedIterator(iterable, (result)=>{
            if (state !== 'pending') {
                // shouldn't happen
                return;
            }
            switch(result.status){
                case 'yield':
                    buffer.push([
                        iterator,
                        result
                    ]);
                    break;
                case 'return':
                    iterators.delete(iterator);
                    break;
                case 'error':
                    buffer.push([
                        iterator,
                        result
                    ]);
                    iterators.delete(iterator);
                    break;
            }
            flushSignal.resolve();
        });
        iterators.add(iterator);
        iterator.pull();
    }
    return {
        add (iterable) {
            switch(state){
                case 'idle':
                    iterables.push(iterable);
                    break;
                case 'pending':
                    initIterable(iterable);
                    break;
            }
        },
        async *[Symbol.asyncIterator] () {
            const env = {
                stack: [],
                error: void 0,
                hasError: false
            };
            try {
                if (state !== 'idle') {
                    throw new Error('Cannot iterate twice');
                }
                state = 'pending';
                const _finally = _ts_add_disposable_resource(env, makeAsyncResource({}, async ()=>{
                    state = 'done';
                    const errors = [];
                    await Promise.all(Array.from(iterators.values()).map(async (it)=>{
                        try {
                            await it.destroy();
                        } catch (cause) {
                            errors.push(cause);
                        }
                    }));
                    buffer.length = 0;
                    iterators.clear();
                    flushSignal.resolve();
                    if (errors.length > 0) {
                        throw new AggregateError(errors);
                    }
                }), true);
                ;
                while(iterables.length > 0){
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    initIterable(iterables.shift());
                }
                while(iterators.size > 0){
                    await flushSignal.promise;
                    while(buffer.length > 0){
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const [iterator, result] = buffer.shift();
                        switch(result.status){
                            case 'yield':
                                yield result.value;
                                iterator.pull();
                                break;
                            case 'error':
                                throw result.error;
                        }
                    }
                    flushSignal = createDeferred();
                }
            } catch (e) {
                env.error = e;
                env.hasError = true;
            } finally{
                const result = _ts_dispose_resources(env);
                if (result) await result;
            }
        }
    };
}

export { mergeAsyncIterables };
