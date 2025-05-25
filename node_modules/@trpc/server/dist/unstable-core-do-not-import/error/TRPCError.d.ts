import type { TRPC_ERROR_CODE_KEY } from '../rpc/codes';
export declare function getCauseFromUnknown(cause: unknown): Error | undefined;
export declare function getTRPCErrorFromUnknown(cause: unknown): TRPCError;
export declare class TRPCError extends Error {
    readonly cause?: Error;
    readonly code: "PARSE_ERROR" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" | "NOT_IMPLEMENTED" | "BAD_GATEWAY" | "SERVICE_UNAVAILABLE" | "GATEWAY_TIMEOUT" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_SUPPORTED" | "TIMEOUT" | "CONFLICT" | "PRECONDITION_FAILED" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "UNPROCESSABLE_CONTENT" | "TOO_MANY_REQUESTS" | "CLIENT_CLOSED_REQUEST";
    constructor(opts: {
        message?: string;
        code: TRPC_ERROR_CODE_KEY;
        cause?: unknown;
    });
}
//# sourceMappingURL=TRPCError.d.ts.map