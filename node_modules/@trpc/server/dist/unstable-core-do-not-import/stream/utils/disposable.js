'use strict';

// @ts-expect-error - polyfilling symbol
// eslint-disable-next-line no-restricted-syntax
var _Symbol, // @ts-expect-error - polyfilling symbol
// eslint-disable-next-line no-restricted-syntax
_Symbol1;
(_Symbol = Symbol).dispose ?? (_Symbol.dispose = Symbol());
(_Symbol1 = Symbol).asyncDispose ?? (_Symbol1.asyncDispose = Symbol());
/**
 * Takes a value and a dispose function and returns a new object that implements the Disposable interface.
 * The returned object is the original value augmented with a Symbol.dispose method.
 * @param thing The value to make disposable
 * @param dispose Function to call when disposing the resource
 * @returns The original value with Symbol.dispose method added
 */ function makeResource(thing, dispose) {
    const it = thing;
    // eslint-disable-next-line no-restricted-syntax
    const existing = it[Symbol.dispose];
    // eslint-disable-next-line no-restricted-syntax
    it[Symbol.dispose] = ()=>{
        dispose();
        existing?.();
    };
    return it;
}
/**
 * Takes a value and an async dispose function and returns a new object that implements the AsyncDisposable interface.
 * The returned object is the original value augmented with a Symbol.asyncDispose method.
 * @param thing The value to make async disposable
 * @param dispose Async function to call when disposing the resource
 * @returns The original value with Symbol.asyncDispose method added
 */ function makeAsyncResource(thing, dispose) {
    const it = thing;
    // eslint-disable-next-line no-restricted-syntax
    const existing = it[Symbol.asyncDispose];
    // eslint-disable-next-line no-restricted-syntax
    it[Symbol.asyncDispose] = async ()=>{
        await dispose();
        await existing?.();
    };
    return it;
}

exports.makeAsyncResource = makeAsyncResource;
exports.makeResource = makeResource;
