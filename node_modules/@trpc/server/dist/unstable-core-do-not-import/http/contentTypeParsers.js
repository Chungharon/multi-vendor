'use strict';

const octetInputParser = {
    _input: null,
    _output: null,
    parse (input) {
        if (input instanceof ReadableStream) {
            return input;
        }
        throw new Error(`Parsed input was expected to be a ReadableStream but was: ${typeof input}`);
    }
};

exports.octetInputParser = octetInputParser;
