import type { InvertKeyValue, ValueOf } from '../types';
/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
export declare const TRPC_ERROR_CODES_BY_KEY: {
    /**
     * Invalid JSON was received by the server.
     * An error occurred on the server while parsing the JSON text.
     */
    readonly PARSE_ERROR: -32700;
    /**
     * The JSON sent is not a valid Request object.
     */
    readonly BAD_REQUEST: -32600;
    readonly INTERNAL_SERVER_ERROR: -32603;
    readonly NOT_IMPLEMENTED: -32603;
    readonly BAD_GATEWAY: -32603;
    readonly SERVICE_UNAVAILABLE: -32603;
    readonly GATEWAY_TIMEOUT: -32603;
    readonly UNAUTHORIZED: -32001;
    readonly FORBIDDEN: -32003;
    readonly NOT_FOUND: -32004;
    readonly METHOD_NOT_SUPPORTED: -32005;
    readonly TIMEOUT: -32008;
    readonly CONFLICT: -32009;
    readonly PRECONDITION_FAILED: -32012;
    readonly PAYLOAD_TOO_LARGE: -32013;
    readonly UNSUPPORTED_MEDIA_TYPE: -32015;
    readonly UNPROCESSABLE_CONTENT: -32022;
    readonly TOO_MANY_REQUESTS: -32029;
    readonly CLIENT_CLOSED_REQUEST: -32099;
};
export declare const TRPC_ERROR_CODES_BY_NUMBER: InvertKeyValue<typeof TRPC_ERROR_CODES_BY_KEY>;
export type TRPC_ERROR_CODE_NUMBER = ValueOf<typeof TRPC_ERROR_CODES_BY_KEY>;
export type TRPC_ERROR_CODE_KEY = keyof typeof TRPC_ERROR_CODES_BY_KEY;
//# sourceMappingURL=codes.d.ts.map