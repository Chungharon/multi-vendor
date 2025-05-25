'use strict';

/** @internal */ const unsetMarker = Symbol();
/**
 * Ensures there are no duplicate keys when building a procedure.
 * @internal
 */ function mergeWithoutOverrides(obj1, ...objs) {
    const newObj = Object.assign(Object.create(null), obj1);
    for (const overrides of objs){
        for(const key in overrides){
            if (key in newObj && newObj[key] !== overrides[key]) {
                throw new Error(`Duplicate key ${key}`);
            }
            newObj[key] = overrides[key];
        }
    }
    return newObj;
}
/**
 * Check that value is object
 * @internal
 */ function isObject(value) {
    return !!value && !Array.isArray(value) && typeof value === 'object';
}
function isFunction(fn) {
    return typeof fn === 'function';
}
/**
 * Create an object without inheriting anything from `Object.prototype`
 * @internal
 */ function omitPrototype(obj) {
    return Object.assign(Object.create(null), obj);
}
const asyncIteratorsSupported = typeof Symbol === 'function' && !!Symbol.asyncIterator;
function isAsyncIterable(value) {
    return asyncIteratorsSupported && isObject(value) && Symbol.asyncIterator in value;
}
/**
 * Run an IIFE
 */ const run = (fn)=>fn();
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
function identity(it) {
    return it;
}
/**
 * Generic runtime assertion function. Throws, if the condition is not `true`.
 *
 * Can be used as a slightly less dangerous variant of type assertions. Code
 * mistakes would be revealed at runtime then (hopefully during testing).
 */ function assert(condition, msg = 'no additional info') {
    if (!condition) {
        throw new Error(`AssertionError: ${msg}`);
    }
}
function sleep(ms = 0) {
    return new Promise((res)=>setTimeout(res, ms));
}
/**
 * Ponyfill for
 * [`AbortSignal.any`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static).
 */ function abortSignalsAnyPonyfill(signals) {
    if (typeof AbortSignal.any === 'function') {
        return AbortSignal.any(signals);
    }
    const ac = new AbortController();
    for (const signal of signals){
        if (signal.aborted) {
            trigger();
            break;
        }
        signal.addEventListener('abort', trigger, {
            once: true
        });
    }
    return ac.signal;
    function trigger() {
        ac.abort();
        for (const signal of signals){
            signal.removeEventListener('abort', trigger);
        }
    }
}

exports.abortSignalsAnyPonyfill = abortSignalsAnyPonyfill;
exports.assert = assert;
exports.identity = identity;
exports.isAsyncIterable = isAsyncIterable;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.mergeWithoutOverrides = mergeWithoutOverrides;
exports.noop = noop;
exports.omitPrototype = omitPrototype;
exports.run = run;
exports.sleep = sleep;
exports.unsetMarker = unsetMarker;
