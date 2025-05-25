'use strict';

var getFetch = require('../../getFetch.js');
var transformer = require('../../internals/transformer.js');

function resolveHTTPLinkOptions(opts) {
    return {
        url: opts.url.toString(),
        fetch: opts.fetch,
        transformer: transformer.getTransformer(opts.transformer),
        methodOverride: opts.methodOverride
    };
}
// https://github.com/trpc/trpc/pull/669
function arrayToDict(array) {
    const dict = {};
    for(let index = 0; index < array.length; index++){
        const element = array[index];
        dict[index] = element;
    }
    return dict;
}
const METHOD = {
    query: 'GET',
    mutation: 'POST',
    subscription: 'PATCH'
};
function getInput(opts) {
    return 'input' in opts ? opts.transformer.input.serialize(opts.input) : arrayToDict(opts.inputs.map((_input)=>opts.transformer.input.serialize(_input)));
}
const getUrl = (opts)=>{
    const parts = opts.url.split('?');
    const base = parts[0].replace(/\/$/, ''); // Remove any trailing slashes
    let url = base + '/' + opts.path;
    const queryParts = [];
    if (parts[1]) {
        queryParts.push(parts[1]);
    }
    if ('inputs' in opts) {
        queryParts.push('batch=1');
    }
    if (opts.type === 'query' || opts.type === 'subscription') {
        const input = getInput(opts);
        if (input !== undefined && opts.methodOverride !== 'POST') {
            queryParts.push(`input=${encodeURIComponent(JSON.stringify(input))}`);
        }
    }
    if (queryParts.length) {
        url += '?' + queryParts.join('&');
    }
    return url;
};
const getBody = (opts)=>{
    if (opts.type === 'query' && opts.methodOverride !== 'POST') {
        return undefined;
    }
    const input = getInput(opts);
    return input !== undefined ? JSON.stringify(input) : undefined;
};
const jsonHttpRequester = (opts)=>{
    return httpRequest({
        ...opts,
        contentTypeHeader: 'application/json',
        getUrl,
        getBody
    });
};
/**
 * Polyfill for DOMException with AbortError name
 */ class AbortError extends Error {
    constructor(){
        const name = 'AbortError';
        super(name);
        this.name = name;
        this.message = name;
    }
}
/**
 * Polyfill for `signal.throwIfAborted()`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/throwIfAborted
 */ const throwIfAborted = (signal)=>{
    if (!signal?.aborted) {
        return;
    }
    // If available, use the native implementation
    signal.throwIfAborted?.();
    // If we have `DOMException`, use it
    if (typeof DOMException !== 'undefined') {
        throw new DOMException('AbortError', 'AbortError');
    }
    // Otherwise, use our own implementation
    throw new AbortError();
};
async function fetchHTTPResponse(opts) {
    throwIfAborted(opts.signal);
    const url = opts.getUrl(opts);
    const body = opts.getBody(opts);
    const { type } = opts;
    const resolvedHeaders = await (async ()=>{
        const heads = await opts.headers();
        if (Symbol.iterator in heads) {
            return Object.fromEntries(heads);
        }
        return heads;
    })();
    const headers = {
        ...opts.contentTypeHeader ? {
            'content-type': opts.contentTypeHeader
        } : {},
        ...opts.trpcAcceptHeader ? {
            'trpc-accept': opts.trpcAcceptHeader
        } : undefined,
        ...resolvedHeaders
    };
    return getFetch.getFetch(opts.fetch)(url, {
        method: opts.methodOverride ?? METHOD[type],
        signal: opts.signal,
        body,
        headers
    });
}
async function httpRequest(opts) {
    const meta = {};
    const res = await fetchHTTPResponse(opts);
    meta.response = res;
    const json = await res.json();
    meta.responseJSON = json;
    return {
        json: json,
        meta
    };
}

exports.fetchHTTPResponse = fetchHTTPResponse;
exports.getBody = getBody;
exports.getInput = getInput;
exports.getUrl = getUrl;
exports.httpRequest = httpRequest;
exports.jsonHttpRequester = jsonHttpRequester;
exports.resolveHTTPLinkOptions = resolveHTTPLinkOptions;
