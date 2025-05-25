import { TRPCError } from './error/TRPCError';
import type { ParseFn } from './parser';
import type { ProcedureType } from './procedure';
import type { GetRawInputFn, Overwrite, Simplify } from './types';
/** @internal */
export declare const middlewareMarker: "middlewareMarker" & {
    __brand: "middlewareMarker";
};
type MiddlewareMarker = typeof middlewareMarker;
interface MiddlewareResultBase {
    /**
     * All middlewares should pass through their `next()`'s output.
     * Requiring this marker makes sure that can't be forgotten at compile-time.
     */
    readonly marker: MiddlewareMarker;
}
interface MiddlewareOKResult<_TContextOverride> extends MiddlewareResultBase {
    ok: true;
    data: unknown;
}
interface MiddlewareErrorResult<_TContextOverride> extends MiddlewareResultBase {
    ok: false;
    error: TRPCError;
}
/**
 * @internal
 */
export type MiddlewareResult<_TContextOverride> = MiddlewareErrorResult<_TContextOverride> | MiddlewareOKResult<_TContextOverride>;
/**
 * @internal
 */
export interface MiddlewareBuilder<TContext, TMeta, TContextOverrides, TInputOut> {
    /**
     * Create a new builder based on the current middleware builder
     */
    unstable_pipe<$ContextOverridesOut>(fn: MiddlewareFunction<TContext, TMeta, TContextOverrides, $ContextOverridesOut, TInputOut> | MiddlewareBuilder<Overwrite<TContext, TContextOverrides>, TMeta, $ContextOverridesOut, TInputOut>): MiddlewareBuilder<TContext, TMeta, Overwrite<TContextOverrides, $ContextOverridesOut>, TInputOut>;
    /**
     * List of middlewares within this middleware builder
     */
    _middlewares: MiddlewareFunction<TContext, TMeta, TContextOverrides, object, TInputOut>[];
}
/**
 * @internal
 */
export type MiddlewareFunction<TContext, TMeta, TContextOverridesIn, $ContextOverridesOut, TInputOut> = {
    (opts: {
        ctx: Simplify<Overwrite<TContext, TContextOverridesIn>>;
        type: ProcedureType;
        path: string;
        input: TInputOut;
        getRawInput: GetRawInputFn;
        meta: TMeta | undefined;
        signal: AbortSignal | undefined;
        next: {
            (): Promise<MiddlewareResult<TContextOverridesIn>>;
            <$ContextOverride>(opts: {
                ctx?: $ContextOverride;
                input?: unknown;
            }): Promise<MiddlewareResult<$ContextOverride>>;
            (opts: {
                getRawInput: GetRawInputFn;
            }): Promise<MiddlewareResult<TContextOverridesIn>>;
        };
    }): Promise<MiddlewareResult<$ContextOverridesOut>>;
    _type?: string | undefined;
};
export type AnyMiddlewareFunction = MiddlewareFunction<any, any, any, any, any>;
export type AnyMiddlewareBuilder = MiddlewareBuilder<any, any, any, any>;
/**
 * @internal
 */
export declare function createMiddlewareFactory<TContext, TMeta, TInputOut = unknown>(): <$ContextOverrides>(fn: MiddlewareFunction<TContext, TMeta, object, $ContextOverrides, TInputOut>) => MiddlewareBuilder<TContext, TMeta, $ContextOverrides, TInputOut>;
/**
 * Create a standalone middleware
 * @see https://trpc.io/docs/v11/server/middlewares#experimental-standalone-middlewares
 * @deprecated use `.concat()` instead
 */
export declare const experimental_standaloneMiddleware: <TCtx extends {
    ctx?: object;
    meta?: object;
    input?: unknown;
}>() => {
    create: <$ContextOverrides>(fn: MiddlewareFunction<TCtx extends {
        ctx: infer T extends object;
    } ? T : any, TCtx extends {
        meta: infer T_1 extends object;
    } ? T_1 : object, object, $ContextOverrides, TCtx extends {
        input: infer T_2;
    } ? T_2 : unknown>) => MiddlewareBuilder<TCtx extends {
        ctx: infer T extends object;
    } ? T : any, TCtx extends {
        meta: infer T_1 extends object;
    } ? T_1 : object, $ContextOverrides, TCtx extends {
        input: infer T_2;
    } ? T_2 : unknown>;
};
/**
 * @internal
 * Please note, `trpc-openapi` uses this function.
 */
export declare function createInputMiddleware<TInput>(parse: ParseFn<TInput>): AnyMiddlewareFunction;
/**
 * @internal
 */
export declare function createOutputMiddleware<TOutput>(parse: ParseFn<TOutput>): AnyMiddlewareFunction;
export {};
//# sourceMappingURL=middleware.d.ts.map