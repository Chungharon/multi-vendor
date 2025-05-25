import { Unpromise } from '../../../vendor/unpromise/unpromise.mjs';
import { throwAbortError } from '../../http/abortError.mjs';
import { makeAsyncResource } from './disposable.mjs';
import { timerResource, disposablePromiseTimerResult } from './timerResource.mjs';

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
function iteratorResource(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    return makeAsyncResource(iterator, async ()=>{
        await iterator.return?.();
    });
}
/**
 * Derives a new {@link AsyncGenerator} based on {@link iterable}, that automatically aborts after the specified duration.
 */ async function* withMaxDuration(iterable, opts) {
    const env = {
        stack: [],
        error: void 0,
        hasError: false
    };
    try {
        const iterator = _ts_add_disposable_resource(env, iteratorResource(iterable), true);
        ;
        const timer = _ts_add_disposable_resource(env, timerResource(opts.maxDurationMs), false);
        ;
        const timerPromise = timer.start();
        // declaration outside the loop for garbage collection reasons
        let result;
        while(true){
            result = await Unpromise.race([
                iterator.next(),
                timerPromise
            ]);
            if (result === disposablePromiseTimerResult) {
                // cancelled due to timeout
                throwAbortError();
            }
            if (result.done) {
                return result;
            }
            yield result.value;
            // free up reference for garbage collection
            result = null;
        }
    } catch (e) {
        env.error = e;
        env.hasError = true;
    } finally{
        const result = _ts_dispose_resources(env);
        if (result) await result;
    }
}
/**
 * Derives a new {@link AsyncGenerator} based of {@link iterable}, that yields its first
 * {@link count} values. Then, a grace period of {@link gracePeriodMs} is started in which further
 * values may still come through. After this period, the generator aborts.
 */ async function* takeWithGrace(iterable, opts) {
    const env = {
        stack: [],
        error: void 0,
        hasError: false
    };
    try {
        const iterator = _ts_add_disposable_resource(env, iteratorResource(iterable), true);
        ;
        // declaration outside the loop for garbage collection reasons
        let result;
        const timer = _ts_add_disposable_resource(env, timerResource(opts.gracePeriodMs), false);
        ;
        let count = opts.count;
        let timerPromise = new Promise(()=>{
        // never resolves
        });
        while(true){
            result = await Unpromise.race([
                iterator.next(),
                timerPromise
            ]);
            if (result === disposablePromiseTimerResult) {
                throwAbortError();
            }
            if (result.done) {
                return result.value;
            }
            yield result.value;
            if (--count === 0) {
                timerPromise = timer.start();
            }
            // free up reference for garbage collection
            result = null;
        }
    } catch (e) {
        env.error = e;
        env.hasError = true;
    } finally{
        const result = _ts_dispose_resources(env);
        if (result) await result;
    }
}

export { iteratorResource, takeWithGrace, withMaxDuration };
