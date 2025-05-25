'use strict';

var getHTTPStatusCode = require('../http/getHTTPStatusCode.js');
var codes = require('../rpc/codes.js');

/**
 * @internal
 */ function getErrorShape(opts) {
    const { path, error, config } = opts;
    const { code } = opts.error;
    const shape = {
        message: error.message,
        code: codes.TRPC_ERROR_CODES_BY_KEY[code],
        data: {
            code,
            httpStatus: getHTTPStatusCode.getHTTPStatusCodeFromError(error)
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

exports.getErrorShape = getErrorShape;
