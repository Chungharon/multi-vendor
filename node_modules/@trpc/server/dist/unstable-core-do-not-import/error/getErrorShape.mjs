import { getHTTPStatusCodeFromError } from '../http/getHTTPStatusCode.mjs';
import { TRPC_ERROR_CODES_BY_KEY } from '../rpc/codes.mjs';

/**
 * @internal
 */ function getErrorShape(opts) {
    const { path, error, config } = opts;
    const { code } = opts.error;
    const shape = {
        message: error.message,
        code: TRPC_ERROR_CODES_BY_KEY[code],
        data: {
            code,
            httpStatus: getHTTPStatusCodeFromError(error)
        }
    };
    if (config.isDev && typeof opts.error.stack === 'string') {
        shape.data.stack = opts.error.stack;
    }
    if (typeof path === 'string') {
        shape.data.path = path;
    }
    return config.errorFormatter({
        ...opts,
        shape
    });
}

export { getErrorShape };
