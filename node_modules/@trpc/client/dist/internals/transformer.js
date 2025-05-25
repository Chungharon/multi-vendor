'use strict';

/**
 * @internal
 */ /**
 * @internal
 */ function getTransformer(transformer) {
    const _transformer = transformer;
    if (!_transformer) {
        return {
            input: {
                serialize: (data)=>data,
                deserialize: (data)=>data
            },
            output: {
                serialize: (data)=>data,
                deserialize: (data)=>data
            }
        };
    }
    if ('input' in _transformer) {
        return _transformer;
    }
    return {
        input: _transformer,
        output: _transformer
    };
}

exports.getTransformer = getTransformer;
