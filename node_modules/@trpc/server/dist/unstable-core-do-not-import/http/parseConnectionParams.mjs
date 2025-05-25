import { TRPCError } from '../error/TRPCError.mjs';
import { isObject } from '../utils.mjs';

function parseConnectionParamsFromUnknown(parsed) {
    try {
        if (parsed === null) {
            return null;
        }
        if (!isObject(parsed)) {
            throw new Error('Expected object');
        }
        const nonStringValues = Object.entries(parsed).filter(([_key, value])=>typeof value !== 'string');
        if (nonStringValues.length > 0) {
            throw new Error(`Expected connectionParams to be string values. Got ${nonStringValues.map(([key, value])=>`${key}: ${typeof value}`).join(', ')}`);
        }
        return parsed;
    } catch (cause) {
        throw new TRPCError({
            code: 'PARSE_ERROR',
            message: 'Invalid connection params shape',
            cause
        });
    }
}
function parseConnectionParamsFromString(str) {
    let parsed;
    try {
        parsed = JSON.parse(str);
    } catch (cause) {
        throw new TRPCError({
            code: 'PARSE_ERROR',
            message: 'Not JSON-parsable query params',
            cause
        });
    }
    return parseConnectionParamsFromUnknown(parsed);
}

export { parseConnectionParamsFromString, parseConnectionParamsFromUnknown };
