import type { NodeHTTPResponse } from './types';
/**
 * @internal
 */
export declare function writeResponseBody(opts: {
    res: NodeHTTPResponse;
    signal: AbortSignal;
    body: NonNullable<Response['body']>;
}): Promise<void>;
/**
 * @internal
 */
export declare function writeResponse(opts: {
    request: Request;
    response: Response;
    rawResponse: NodeHTTPResponse;
}): Promise<void>;
//# sourceMappingURL=writeResponse.d.ts.map