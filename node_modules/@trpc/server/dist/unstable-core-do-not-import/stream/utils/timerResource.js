'use strict';

var disposable = require('./disposable.js');

const disposablePromiseTimerResult = Symbol();
function timerResource(ms) {
    let timer = null;
    return disposable.makeResource({
        start () {
            if (timer) {
                throw new Error('Timer already started');
            }
            const promise = new Promise((resolve)=>{
                timer = setTimeout(()=>resolve(disposablePromiseTimerResult), ms);
            });
            return promise;
        }
    }, ()=>{
        if (timer) {
            clearTimeout(timer);
        }
    });
}

exports.disposablePromiseTimerResult = disposablePromiseTimerResult;
exports.timerResource = timerResource;
