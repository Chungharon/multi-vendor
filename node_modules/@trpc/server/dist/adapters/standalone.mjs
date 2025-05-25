import http from 'node:http';
import { run } from '../unstable-core-do-not-import/utils.mjs';
import '../vendor/unpromise/unpromise.mjs';
import '../unstable-core-do-not-import/stream/utils/disposable.mjs';
import '../unstable-core-do-not-import/rootConfig.mjs';
import { nodeHTTPRequestHandler, internal_exceptionHandler } from './node-http/nodeHTTPRequestHandler.mjs';
import { createURL } from './node-http/incomingMessageToRequest.mjs';

function createHandler(opts) {
    const basePath = opts.basePath ?? '/';
    const sliceLength = basePath.length;
    return (req, res)=>{
        let path = '';
        run(async ()=>{
            const url = createURL(req);
            // get procedure(s) path and remove the leading slash
            path = url.pathname.slice(sliceLength);
            await nodeHTTPRequestHandler({
                ...opts,
                req,
                res,
                path
            });
        }).catch(internal_exceptionHandler({
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

export { createHTTP2Handler, createHTTPHandler, createHTTPServer };
