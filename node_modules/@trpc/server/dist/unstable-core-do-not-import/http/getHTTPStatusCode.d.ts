import type { TRPCError } from '../error/TRPCError';
import type { TRPC_ERROR_CODES_BY_KEY, TRPCResponse } from '../rpc';
import type { InvertKeyValue, ValueOf } from '../types';
export declare const JSONRPC2_TO_HTTP_CODE: Record<keyof typeof TRPC_ERROR_CODES_BY_KEY, number>;
export declare const HTTP_CODE_TO_JSONRPC2: InvertKeyValue<typeof JSONRPC2_TO_HTTP_CODE>;
export declare function getStatusCodeFromKey(code: keyof typeof TRPC_ERROR_CODES_BY_KEY): number;
export declare function getStatusKeyFromCode(code: keyof typeof HTTP_CODE_TO_JSONRPC2): ValueOf<typeof HTTP_CODE_TO_JSONRPC2>;
export declare function getHTTPStatusCode(json: TRPCResponse | TRPCResponse[]): number;
export declare function getHTTPStatusCodeFromError(error: TRPCError): number;
//# sourceMappingURL=getHTTPStatusCode.d.ts.map