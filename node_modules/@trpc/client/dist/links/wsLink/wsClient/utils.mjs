import { resultOf } from '../../internals/urlWithConnectionParams.mjs';

function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class TRPCWebSocketClosedError extends Error {
    constructor(opts){
        super(opts.message, {
            cause: opts.cause
        });
        this.name = 'TRPCWebSocketClosedError';
        Object.setPrototypeOf(this, TRPCWebSocketClosedError.prototype);
    }
}
/**
 * Utility class for managing a timeout that can be started, stopped, and reset.
 * Useful for scenarios where the timeout duration is reset dynamically based on events.
 */ class ResettableTimeout {
    /**
   * Resets the current timeout, restarting it with the same duration.
   * Does nothing if no timeout is active.
   */ reset() {
        if (!this.timeout) return;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.onTimeout, this.timeoutMs);
    }
    start() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.onTimeout, this.timeoutMs);
    }
    stop() {
        clearTimeout(this.timeout);
        this.timeout = undefined;
    }
    constructor(onTimeout, timeoutMs){
        _define_property(this, "onTimeout", void 0);
        _define_property(this, "timeoutMs", void 0);
        _define_property(this, "timeout", void 0);
        this.onTimeout = onTimeout;
        this.timeoutMs = timeoutMs;
    }
}
// Ponyfill for Promise.withResolvers https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
/**
 * Resolves a WebSocket URL and optionally appends connection parameters.
 *
 * If connectionParams are provided, appends 'connectionParams=1' query parameter.
 */ async function prepareUrl(urlOptions) {
    const url = await resultOf(urlOptions.url);
    if (!urlOptions.connectionParams) return url;
    // append `?connectionParams=1` when connection params are used
    const prefix = url.includes('?') ? '&' : '?';
    const connectionParams = `${prefix}connectionParams=1`;
    return url + connectionParams;
}
async function buildConnectionMessage(connectionParams) {
    const message = {
        method: 'connectionParams',
        data: await resultOf(connectionParams)
    };
    return JSON.stringify(message);
}

export { ResettableTimeout, TRPCWebSocketClosedError, buildConnectionMessage, prepareUrl, withResolvers };
