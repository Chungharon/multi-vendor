'use strict';

var observable = require('./observable.js');
var operators = require('./operators.js');
var behaviorSubject = require('./behaviorSubject.js');



exports.isObservable = observable.isObservable;
exports.observable = observable.observable;
exports.observableToAsyncIterable = observable.observableToAsyncIterable;
exports.observableToPromise = observable.observableToPromise;
exports.distinctUntilChanged = operators.distinctUntilChanged;
exports.distinctUntilDeepChanged = operators.distinctUntilDeepChanged;
exports.map = operators.map;
exports.share = operators.share;
exports.tap = operators.tap;
exports.behaviorSubject = behaviorSubject.behaviorSubject;
