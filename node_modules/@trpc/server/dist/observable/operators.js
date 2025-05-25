'use strict';

var observable = require('./observable.js');

function map(project) {
    return (source)=>{
        return observable.observable((destination)=>{
            let index = 0;
            const subscription = source.subscribe({
                next (value) {
                    destination.next(project(value, index++));
                },
                error (error) {
                    destination.error(error);
                },
                complete () {
                    destination.complete();
                }
            });
            return subscription;
        });
    };
}
function share(_opts) {
    return (source)=>{
        let refCount = 0;
        let subscription = null;
        const observers = [];
        function startIfNeeded() {
            if (subscription) {
                return;
            }
            subscription = source.subscribe({
                next (value) {
                    for (const observer of observers){
                        observer.next?.(value);
                    }
                },
                error (error) {
                    for (const observer of observers){
                        observer.error?.(error);
                    }
                },
                complete () {
                    for (const observer of observers){
                        observer.complete?.();
                    }
                }
            });
        }
        function resetIfNeeded() {
            // "resetOnRefCountZero"
            if (refCount === 0 && subscription) {
                const _sub = subscription;
                subscription = null;
                _sub.unsubscribe();
            }
        }
        return observable.observable((subscriber)=>{
            refCount++;
            observers.push(subscriber);
            startIfNeeded();
            return {
                unsubscribe () {
                    refCount--;
                    resetIfNeeded();
                    const index = observers.findIndex((v)=>v === subscriber);
                    if (index > -1) {
                        observers.splice(index, 1);
                    }
                }
            };
        });
    };
}
function tap(observer) {
    return (source)=>{
        return observable.observable((destination)=>{
            return source.subscribe({
                next (value) {
                    observer.next?.(value);
                    destination.next(value);
                },
                error (error) {
                    observer.error?.(error);
                    destination.error(error);
                },
                complete () {
                    observer.complete?.();
                    destination.complete();
                }
            });
        });
    };
}
const distinctUnsetMarker = Symbol();
function distinctUntilChanged(compare = (a, b)=>a === b) {
    return (source)=>{
        return observable.observable((destination)=>{
            let lastValue = distinctUnsetMarker;
            return source.subscribe({
                next (value) {
                    if (lastValue !== distinctUnsetMarker && compare(lastValue, value)) {
                        return;
                    }
                    lastValue = value;
                    destination.next(value);
                },
                error (error) {
                    destination.error(error);
                },
                complete () {
                    destination.complete();
                }
            });
        });
    };
}
const isDeepEqual = (a, b)=>{
    if (a === b) {
        return true;
    }
    const bothAreObjects = a && b && typeof a === 'object' && typeof b === 'object';
    return !!bothAreObjects && Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v])=>isDeepEqual(v, b[k]));
};
function distinctUntilDeepChanged() {
    return distinctUntilChanged(isDeepEqual);
}

exports.distinctUntilChanged = distinctUntilChanged;
exports.distinctUntilDeepChanged = distinctUntilDeepChanged;
exports.map = map;
exports.share = share;
exports.tap = tap;
