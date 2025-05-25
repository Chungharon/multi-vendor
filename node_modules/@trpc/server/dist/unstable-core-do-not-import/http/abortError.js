'use strict';

var utils = require('../utils.js');

function isAbortError(error) {
    return utils.isObject(error) && error['name'] === 'AbortError';
}
function throwAbortError(message = 'AbortError') {
    throw new DOMException(message, 'AbortError');
}

exports.isAbortError = isAbortError;
exports.throwAbortError = throwAbortError;
