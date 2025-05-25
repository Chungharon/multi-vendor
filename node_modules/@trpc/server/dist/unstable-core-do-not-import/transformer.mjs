import { isObject } from './utils.mjs';

/**
 * @internal
 */ function getDataTransformer(transformer) {
    if ('input' in transformer) {
        return transformer;
    }
    return {
        input: transformer,
        output: transformer
    };
}
/**
 * @internal
 */ const defaultTransformer = {
    input: {
        serialize: (obj)=>obj,
        deserialize: (obj)=>obj
    },
    output: {
        serialize: (obj)=>obj,
        deserialize: (obj)=>obj
    }
};
function transformTRPCResponseItem(config, item) {
    if ('error' in item) {
        return {
            ...item,
            error: config.transformer.output.serialize(item.error)
        };
    }
    if ('data' in item.result) {
        return {
            ...item,
            result: {
                ...item.result,
                data: config.transformer.output.serialize(item.result.data)
            }
        };
    }
    return item;
}
/**
 * Takes a unserialized `TRPCResponse` and serializes it with the router's transformers
 **/ function transformTRPCResponse(config, itemOrItems) {
    return Array.isArray(itemOrItems) ? itemOrItems.map((item)=>transformTRPCResponseItem(config, item)) : transformTRPCResponseItem(config, itemOrItems);
}
// FIXME:
// - the generics here are probably unnecessary
// - the RPC-spec could probably be simplified to combine HTTP + WS
/** @internal */ function transformResultInner(response, transformer) {
    if ('error' in response) {
        const error = transformer.deserialize(response.error);
        return {
            ok: false,
            error: {
                ...response,
                error
            }
        };
    }
    const result = {
        ...response.result,
        ...(!response.result.type || response.result.type === 'data') && {
            type: 'data',
            data: transformer.deserialize(response.result.data)
        }
    };
    return {
        ok: true,
        result
    };
}
class TransformResultError extends Error {
    constructor(){
        super('Unable to transform response from server');
    }
}
/**
 * Transforms and validates that the result is a valid TRPCResponse
 * @internal
 */ function transformResult(response, transformer) {
    let result;
    try {
        // Use the data transformers on the JSON-response
        result = transformResultInner(response, transformer);
    } catch  {
        throw new TransformResultError();
    }
    // check that output of the transformers is a valid TRPCResponse
    if (!result.ok && (!isObject(result.error.error) || typeof result.error.error['code'] !== 'number')) {
        throw new TransformResultError();
    }
    if (result.ok && !isObject(result.result)) {
        throw new TransformResultError();
    }
    return result;
}

export { defaultTransformer, getDataTransformer, transformResult, transformTRPCResponse };
