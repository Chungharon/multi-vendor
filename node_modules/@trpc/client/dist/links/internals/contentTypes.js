'use strict';

function isOctetType(input) {
    return input instanceof Uint8Array || // File extends from Blob but is only available in nodejs from v20
    input instanceof Blob;
}
function isFormData(input) {
    return input instanceof FormData;
}
function isNonJsonSerializable(input) {
    return isOctetType(input) || isFormData(input);
}

exports.isFormData = isFormData;
exports.isNonJsonSerializable = isNonJsonSerializable;
exports.isOctetType = isOctetType;
