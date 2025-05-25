'use strict';

var codes = require('../rpc/codes.js');
var utils = require('../utils.js');

const JSONRPC2_TO_HTTP_CODE = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_SUPPORTED: 405,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};
const HTTP_CODE_TO_JSONRPC2 = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_SUPPORTED',
    408: 'TIMEOUT',
    409: 'CONFLICT',
    412: 'PRECONDITION_FAILED',
    413: 'PAYLOAD_TOO_LARGE',
    415: 'UNSUPPORTED_MEDIA_TYPE',
    422: 'UNPROCESSABLE_CONTENT',
    429: 'TOO_MANY_REQUESTS',
    499: 'CLIENT_CLOSED_REQUEST',
    500: 'INTERNAL_SERVER_ERROR',
    501: 'NOT_IMPLEMENTED',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT'
};
function getStatusCodeFromKey(code) {
    return JSONRPC2_TO_HTTP_CODE[code] ?? 500;
}
function getStatusKeyFromCode(code) {
    return HTTP_CODE_TO_JSONRPC2[code] ?? 'INTERNAL_SERVER_ERROR';
}
function getHTTPStatusCode(json) {
    const arr = Array.isArray(json) ? json : [
        json
    ];
    const httpStatuses = new Set(arr.map((res)=>{
        if ('error' in res && utils.isObject(res.error.data)) {
            if (typeof res.error.data?.['httpStatus'] === 'number') {
                return res.error.data['httpStatus'];
            }
            const code = codes.TRPC_ERROR_CODES_BY_NUMBER[res.error.code];
            return getStatusCodeFromKey(code);
        }
        return 200;
    }));
    if (httpStatuses.size !== 1) {
        return 207;
    }
    const httpStatus = httpStatuses.values().next().value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return httpStatus;
}
function getHTTPStatusCodeFromError(error) {
    return getStatusCodeFromKey(error.code);
}

exports.HTTP_CODE_TO_JSONRPC2 = HTTP_CODE_TO_JSONRPC2;
exports.JSONRPC2_TO_HTTP_CODE = JSONRPC2_TO_HTTP_CODE;
exports.getHTTPStatusCode = getHTTPStatusCode;
exports.getHTTPStatusCodeFromError = getHTTPStatusCodeFromError;
exports.getStatusCodeFromKey = getStatusCodeFromKey;
exports.getStatusKeyFromCode = getStatusKeyFromCode;
