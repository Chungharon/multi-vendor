'use strict';

var abortError = require('../../unstable-core-do-not-import/http/abortError.js');
require('../../vendor/unpromise/unpromise.js');
require('../../unstable-core-do-not-import/stream/utils/disposable.js');
require('../../unstable-core-do-not-import/rootConfig.js');

// eslint-disable-next-line no-restricted-imports
async function writeResponseBodyChunk(res, chunk) {
    // useful for debugging 🙃
    // console.debug('writing', new TextDecoder().decode(chunk));
    if (res.write(chunk) === false) {
        await new Promise((resolve, reject)=>{
            const onError = (err)=>{
                reject(err);
                cleanup();
            };
            const onDrain = ()=>{
                resolve();
                cleanup();
            };
            const cleanup = ()=>{
                res.off('error', onError);
                res.off('drain', onDrain);
            };
            res.once('error', onError);
            res.once('drain', onDrain);
        });
    }
}
/**
 * @internal
 */ async function writeResponseBody(opts) {
    const { res } = opts;
    try {
        const writableStream = new WritableStream({
            async write (chunk) {
                await writeResponseBodyChunk(res, chunk);
                res.flush?.();
            }
        });
        await opts.body.pipeTo(writableStream, {
            signal: opts.signal
        });
    } catch (err) {
        if (abortError.isAbortError(err)) {
            return;
        }
        throw err;
    }
}
/**
 * @internal
 */ async function writeResponse(opts) {
    const { response, rawResponse } = opts;
    // Only override status code if it hasn't been explicitly set in a procedure etc
    if (rawResponse.statusCode === 200) {
        rawResponse.statusCode = response.status;
    }
    for (const [key, value] of response.headers){
        rawResponse.setHeader(key, value);
    }
    try {
        if (response.body) {
            await writeResponseBody({
                res: rawResponse,
                signal: opts.request.signal,
                body: response.body
            });
        }
    } catch (err) {
        if (!rawResponse.headersSent) {
            rawResponse.statusCode = 500;
        }
        throw err;
    } finally{
        rawResponse.end();
    }
}

exports.writeResponse = writeResponse;
exports.writeResponseBody = writeResponseBody;
