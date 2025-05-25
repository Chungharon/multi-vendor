import type { inferClientTypes, InferrableClientTypes, Maybe, TRPCErrorResponse } from '@trpc/server/unstable-core-do-not-import';
import { type DefaultErrorShape } from '@trpc/server/unstable-core-do-not-import';
type inferErrorShape<TInferrable extends InferrableClientTypes> = inferClientTypes<TInferrable>['errorShape'];
export interface TRPCClientErrorBase<TShape extends DefaultErrorShape> {
    readonly message: string;
    readonly shape: Maybe<TShape>;
    readonly data: Maybe<TShape['data']>;
}
export type TRPCClientErrorLike<TInferrable extends InferrableClientTypes> = TRPCClientErrorBase<inferErrorShape<TInferrable>>;
export declare class TRPCClientError<TRouterOrProcedure extends InferrableClientTypes> extends Error implements TRPCClientErrorBase<inferErrorShape<TRouterOrProcedure>> {
    readonly cause: Error | undefined;
    readonly shape: Maybe<inferErrorShape<TRouterOrProcedure>>;
    readonly data: Maybe<inferErrorShape<TRouterOrProcedure>['data']>;
    /**
     * Additional meta data about the error
     * In the case of HTTP-errors, we'll have `response` and potentially `responseJSON` here
     */
    meta: Record<string, unknown> | undefined;
    constructor(message: string, opts?: {
        result?: Maybe<TRPCErrorResponse<inferErrorShape<TRouterOrProcedure>>>;
        cause?: Error;
        meta?: Record<string, unknown>;
    });
    static from<TRouterOrProcedure extends InferrableClientTypes>(_cause: Error | TRPCErrorResponse<any> | object, opts?: {
        meta?: Record<string, unknown>;
    }): TRPCClientError<TRouterOrProcedure>;
}
export {};
//# sourceMappingURL=TRPCClientError.d.ts.map