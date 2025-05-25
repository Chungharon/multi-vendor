import { makeResource } from './disposable.mjs';

const disposablePromiseTimerResult = Symbol();
function timerResource(ms) {
    let timer = null;
    return makeResource({
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

export { disposablePromiseTimerResult, timerResource };
