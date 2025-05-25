import { isObject } from '@trpc/server/unstable-core-do-not-import';

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
function isTRPCClientError(cause) {
    return cause instanceof TRPCClientError || /**
     * @deprecated
     * Delete in next major
     */ cause instanceof Error && cause.name === 'TRPCClientError';
}
function isTRPCErrorResponse(obj) {
    return isObject(obj) && isObject(obj['error']) && typeof obj['error']['code'] === 'number' && typeof obj['error']['message'] === 'string';
}
function getMessageFromUnknownError(err, fallback) {
    if (typeof err === 'string') {
        return err;
    }
    if (isObject(err) && typeof err['message'] === 'string') {
        return err['message'];
    }
    return fallback;
}
class TRPCClientError extends Error {
    static from(_cause, opts = {}) {
        const cause = _cause;
        if (isTRPCClientError(cause)) {
            if (opts.meta) {
                // Decorate with meta error data
                cause.meta = {
                    ...cause.meta,
                    ...opts.meta
                };
            }
            return cause;
        }
        if (isTRPCErrorResponse(cause)) {
            return new TRPCClientError(cause.error.message, {
                ...opts,
                result: cause
            });
        }
        return new TRPCClientError(getMessageFromUnknownError(cause, 'Unknown error'), {
            ...opts,
            cause: cause
        });
    }
    constructor(message, opts){
        const cause = opts?.cause;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore https://github.com/tc39/proposal-error-cause
        super(message, {
            cause
        }), // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore override doesn't work in all environments due to "This member cannot have an 'override' modifier because it is not declared in the base class 'Error'"
        _define_property(this, "cause", void 0), _define_property(this, "shape", void 0), _define_property(this, "data", void 0), /**
   * Additional meta data about the error
   * In the case of HTTP-errors, we'll have `response` and potentially `responseJSON` here
   */ _define_property(this, "meta", void 0);
        this.meta = opts?.meta;
        this.cause = cause;
        this.shape = opts?.result?.error;
        this.data = opts?.result?.error.data;
        this.name = 'TRPCClientError';
        Object.setPrototypeOf(this, TRPCClientError.prototype);
    }
}

export { TRPCClientError };
