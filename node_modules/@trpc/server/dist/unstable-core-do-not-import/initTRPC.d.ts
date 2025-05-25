import { type DefaultErrorShape, type ErrorFormatter } from './error/formatter';
import { type RootConfig } from './rootConfig';
import { mergeRouters } from './router';
import type { DataTransformerOptions } from './transformer';
import type { Unwrap, ValidateShape } from './types';
type inferErrorFormatterShape<TType> = TType extends ErrorFormatter<any, infer TShape> ? TShape : DefaultErrorShape;
interface RuntimeConfigOptions<TContext extends object, TMeta extends object> extends Partial<Omit<RootConfig<{
    ctx: TContext;
    meta: TMeta;
    errorShape: any;
    transformer: any;
}>, '$types' | 'transformer'>> {
    /**
     * Use a data transformer
     * @see https://trpc.io/docs/v11/data-transformers
     */
    transformer?: DataTransformerOptions;
}
type ContextCallback = (...args: any[]) => object | Promise<object>;
declare class TRPCBuilder<TContext extends object, TMeta extends object> {
    /**
     * Add a context shape as a generic to the root object
     * @see https://trpc.io/docs/v11/server/context
     */
    context<TNewContext extends object | ContextCallback>(): TRPCBuilder<TNewContext extends ContextCallback ? Unwrap<TNewContext> : TNewContext, TMeta>;
    /**
     * Add a meta shape as a generic to the root object
     * @see https://trpc.io/docs/v11/quickstart
     */
    meta<TNewMeta extends object>(): TRPCBuilder<TContext, TNewMeta>;
    /**
     * Create the root object
     * @see https://trpc.io/docs/v11/server/routers#initialize-trpc
     */
    create<TOptions extends RuntimeConfigOptions<TContext, TMeta>>(opts?: ValidateShape<TOptions, RuntimeConfigOptions<TContext, TMeta>>): {
        /**
         * Your router config
         * @internal
         */
        _config: RootConfig<{
            ctx: TContext;
            meta: TMeta;
            errorShape: undefined extends TOptions["errorFormatter"] ? DefaultErrorShape : inferErrorFormatterShape<TOptions["errorFormatter"]>;
            transformer: undefined extends TOptions["transformer"] ? false : true;
        }>;
        /**
         * Builder object for creating procedures
         * @see https://trpc.io/docs/v11/server/procedures
         */
        procedure: import("./procedureBuilder").ProcedureBuilder<TContext, TMeta, object, typeof import("./utils").unsetMarker, typeof import("./utils").unsetMarker, typeof import("./utils").unsetMarker, typeof import("./utils").unsetMarker, false>;
        /**
         * Create reusable middlewares
         * @see https://trpc.io/docs/v11/server/middlewares
         */
        middleware: <$ContextOverrides>(fn: import("./middleware").MiddlewareFunction<TContext, TMeta, object, $ContextOverrides, unknown>) => import("./middleware").MiddlewareBuilder<TContext, TMeta, $ContextOverrides, unknown>;
        /**
         * Create a router
         * @see https://trpc.io/docs/v11/server/routers
         */
        router: <TInput extends import("./router").CreateRouterOptions>(input: TInput) => import("./router").BuiltRouter<{
            ctx: TContext;
            meta: TMeta;
            errorShape: undefined extends TOptions["errorFormatter"] ? DefaultErrorShape : inferErrorFormatterShape<TOptions["errorFormatter"]>;
            transformer: undefined extends TOptions["transformer"] ? false : true;
        }, import("./router").DecorateCreateRouterOptions<TInput>>;
        /**
         * Merge Routers
         * @see https://trpc.io/docs/v11/server/merging-routers
         */
        mergeRouters: typeof mergeRouters;
        /**
         * Create a server-side caller for a router
         * @see https://trpc.io/docs/v11/server/server-side-calls
         */
        createCallerFactory: <TRecord extends import("./router").RouterRecord>(router: Pick<import("./router").Router<{
            ctx: TContext;
            meta: TMeta;
            errorShape: undefined extends TOptions["errorFormatter"] ? DefaultErrorShape : inferErrorFormatterShape<TOptions["errorFormatter"]>;
            transformer: undefined extends TOptions["transformer"] ? false : true;
        }, TRecord>, "_def">) => import("./router").RouterCaller<{
            ctx: TContext;
            meta: TMeta;
            errorShape: undefined extends TOptions["errorFormatter"] ? DefaultErrorShape : inferErrorFormatterShape<TOptions["errorFormatter"]>;
            transformer: undefined extends TOptions["transformer"] ? false : true;
        }, TRecord>;
    };
}
/**
 * Builder to initialize the tRPC root object - use this exactly once per backend
 * @see https://trpc.io/docs/v11/quickstart
 */
export declare const initTRPC: TRPCBuilder<object, object>;
export type { TRPCBuilder };
//# sourceMappingURL=initTRPC.d.ts.map