import type { NodeHTTPRequest, NodeHTTPResponse } from './types';
export declare function createURL(req: NodeHTTPRequest): URL;
/**
 * Convert an [`IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage) to a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)
 */
export declare function incomingMessageToRequest(req: NodeHTTPRequest, res: NodeHTTPResponse, opts: {
    /**
     * Max body size in bytes. If the body is larger than this, the request will be aborted
     */
    maxBodySize: number | null;
}): Request;
//# sourceMappingURL=incomingMessageToRequest.d.ts.map