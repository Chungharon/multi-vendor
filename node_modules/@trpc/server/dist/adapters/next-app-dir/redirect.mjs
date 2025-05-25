import { TRPCError } from '../../unstable-core-do-not-import/error/TRPCError.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';

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
/**
 * @internal
 */ class TRPCRedirectError extends TRPCError {
    constructor(url, redirectType){
        super({
            // TODO(?): This should maybe a custom error code
            code: 'UNPROCESSABLE_CONTENT',
            message: `Redirect error to "${url}" that will be handled by Next.js`
        }), _define_property(this, "args", void 0);
        this.args = [
            url.toString(),
            redirectType
        ];
    }
}
/**
 * Like `next/navigation`'s `redirect()` but throws a `TRPCError` that later will be handled by Next.js
 * This provides better typesafety than the `next/navigation`'s `redirect()` since the action continues
 * to execute on the frontend even if Next's `redirect()` has a return type of `never`.
 * @public
 * @remark You should only use this if you're also using `nextAppDirCaller`.
 */ const redirect = (url, redirectType)=>{
    // We rethrow this internally so the returntype on the client is undefined.
    return new TRPCRedirectError(url, redirectType);
};

export { TRPCRedirectError, redirect };
