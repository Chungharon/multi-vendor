'use strict';

var http = require('node:http');
var utils = require('../unstable-core-do-not-import/utils.js');
require('../vendor/unpromise/unpromise.js');
require('../unstable-core-do-not-import/stream/utils/disposable.js');
require('../unstable-core-do-not-import/rootConfig.js');
var nodeHTTPRequestHandler = require('./node-http/nodeHTTPRequestHandler.js');
var incomingMessageToRequest = require('./node-http/incomingMessageToRequest.js');

function createHandler(opts) {
    const basePath = opts.basePath ?? '/';
    const sliceLength = basePath.length;
    return (req, res)=>{
        let path = '';
        utils.run(async ()=>{
            const url = incomingMessageToRequest.createURL(req);
            // get procedure(s) path and remove the leading slash
            path = url.pathname.slice(sliceLength);
            await nodeHTTPRequestHandler.nodeHTTPRequestHandler({
                ...opts,
                req,
                res,
                path
            });
        }).catch(nodeHTTPRequestHandler.internal_exceptionHandler({
            req,
            res,
            path,
            ...opts
        }));
    };
}
/**
 * @internal
 */ function createHTTPHandler(opts) {
    return createHandler(opts);
}
function createHTTPServer(opts) {
    return http.createServer(createHTTPHandler(opts));
}
function createHTTP2Handler(opts) {
    return createHandler(opts);
}

exports.createHTTP2Handler = createHTTP2Handler;
exports.createHTTPHandler = createHTTPHandler;
exports.createHTTPServer = createHTTPServer;
