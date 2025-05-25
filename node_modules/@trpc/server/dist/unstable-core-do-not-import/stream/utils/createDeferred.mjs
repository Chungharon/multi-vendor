/* eslint-disable @typescript-eslint/no-non-null-assertion */ function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}

export { createDeferred };
