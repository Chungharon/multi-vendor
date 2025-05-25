import { isObject } from '../utils.mjs';

function isAbortError(error) {
    return isObject(error) && error['name'] === 'AbortError';
}
function throwAbortError(message = 'AbortError') {
    throw new DOMException(message, 'AbortError');
}

export { isAbortError, throwAbortError };
