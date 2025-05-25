'use strict';

/** @public */ function isObservable(x) {
    return typeof x === 'object' && x !== null && 'subscribe' in x;
}
/** @public */ function observable(subscribe) {
    const self = {
        subscribe (observer) {
            let teardownRef = null;
            let isDone = false;
            let unsubscribed = false;
            let teardownImmediately = false;
            function unsubscribe() {
                if (teardownRef === null) {
                    teardownImmediately = true;
                    return;
                }
                if (unsubscribed) {
                    return;
                }
                unsubscribed = true;
                if (typeof teardownRef === 'function') {
                    teardownRef();
                } else if (teardownRef) {
                    teardownRef.unsubscribe();
                }
            }
            teardownRef = subscribe({
                next (value) {
                    if (isDone) {
                        return;
                    }
                    observer.next?.(value);
                },
                error (err) {
                    if (isDone) {
                        return;
                    }
                    isDone = true;
                    observer.error?.(err);
                    unsubscribe();
                },
                complete () {
                    if (isDone) {
                        return;
                    }
                    isDone = true;
                    observer.complete?.();
                    unsubscribe();
                }
            });
            if (teardownImmediately) {
                unsubscribe();
            }
            return {
                unsubscribe
            };
        },
        pipe (...operations) {
            return operations.reduce(pipeReducer, self);
        }
    };
    return self;
}
function pipeReducer(prev, fn) {
    return fn(prev);
}
/** @internal */ function observableToPromise(observable) {
    const ac = new AbortController();
    const promise = new Promise((resolve, reject)=>{
        let isDone = false;
        function onDone() {
            if (isDone) {
                return;
            }
            isDone = true;
            obs$.unsubscribe();
        }
        ac.signal.addEventListener('abort', ()=>{
            reject(ac.signal.reason);
        });
        const obs$ = observable.subscribe({
            next (data) {
                isDone = true;
                resolve(data);
                onDone();
            },
            error (data) {
                reject(data);
            },
            complete () {
                ac.abort();
                onDone();
            }
        });
    });
    return promise;
}
/**
 * @internal
 */ function observableToReadableStream(observable, signal) {
    let unsub = null;
    const onAbort = ()=>{
        unsub?.unsubscribe();
        unsub = null;
        signal.removeEventListener('abort', onAbort);
    };
    return new ReadableStream({
        start (controller) {
            unsub = observable.subscribe({
                next (data) {
                    controller.enqueue({
                        ok: true,
                        value: data
                    });
                },
                error (error) {
                    controller.enqueue({
                        ok: false,
                        error
                    });
                    controller.close();
                },
                complete () {
                    controller.close();
                }
            });
            if (signal.aborted) {
                onAbort();
            } else {
                signal.addEventListener('abort', onAbort, {
                    once: true
                });
            }
        },
        cancel () {
            onAbort();
        }
    });
}
/** @internal */ function observableToAsyncIterable(observable, signal) {
    const stream = observableToReadableStream(observable, signal);
    const reader = stream.getReader();
    const iterator = {
        async next () {
            const value = await reader.read();
            if (value.done) {
                return {
                    value: undefined,
                    done: true
                };
            }
            const { value: result } = value;
            if (!result.ok) {
                throw result.error;
            }
            return {
                value: result.value,
                done: false
            };
        },
        async return () {
            await reader.cancel();
            return {
                value: undefined,
                done: true
            };
        }
    };
    return {
        [Symbol.asyncIterator] () {
            return iterator;
        }
    };
}

exports.isObservable = isObservable;
exports.observable = observable;
exports.observableToAsyncIterable = observableToAsyncIterable;
exports.observableToPromise = observableToPromise;
