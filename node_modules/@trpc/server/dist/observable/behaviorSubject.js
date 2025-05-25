'use strict';

var observable = require('./observable.js');

/**
 * @internal
 * An observable that maintains and provides a "current value" to subscribers
 * @see https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject
 */ function behaviorSubject(initialValue) {
    let value = initialValue;
    const observerList = [];
    const addObserver = (observer)=>{
        if (value !== undefined) {
            observer.next(value);
        }
        observerList.push(observer);
    };
    const removeObserver = (observer)=>{
        observerList.splice(observerList.indexOf(observer), 1);
    };
    const obs = observable.observable((observer)=>{
        addObserver(observer);
        return ()=>{
            removeObserver(observer);
        };
    });
    obs.next = (nextValue)=>{
        if (value === nextValue) {
            return;
        }
        value = nextValue;
        for (const observer of observerList){
            observer.next(nextValue);
        }
    };
    obs.get = ()=>value;
    return obs;
}

exports.behaviorSubject = behaviorSubject;
