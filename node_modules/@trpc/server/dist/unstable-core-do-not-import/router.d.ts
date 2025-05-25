import type { Observable } from '../observable';
import { TRPCError } from './error/TRPCError';
import type { AnyProcedure, ErrorHandlerOptions, inferProcedureInput, inferProcedureOutput, LegacyObservableSubscriptionProcedure } from './procedure';
import type { ProcedureCallOptions } from './procedureBuilder';
import type { AnyRootTypes, RootConfig } from './rootConfig';
import type { MaybePromise } from './types';
export interface RouterRecord {
    [key: string]: AnyProcedure | RouterRecord;
}
type DecorateProcedure<TProcedure extends AnyProcedure> = (input: inferProcedureInput<TProcedure>) => Promise<TProcedure['_def']['type'] extends 'subscription' ? TProcedure extends LegacyObservableSubscriptionProcedure<any> ? Observable<inferProcedureOutput<TProcedure>, TRPCError> : inferProcedureOutput<TProcedure> : inferProcedureOutput<TProcedure>>;
/**
 * @internal
 */
export type DecorateRouterRecord<TRecord extends RouterRecord> = {
    [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value ? $Value extends AnyProcedure ? DecorateProcedure<$Value> : $Value extends RouterRecord ? DecorateRouterRecord<$Value> : never : never;
};
/**
 * @internal
 */
export type RouterCallerErrorHandler<TContext> = (opts: ErrorHandlerOptions<TContext>) => void;
/**
 * @internal
 */
export type RouterCaller<TRoot extends AnyRootTypes, TRecord extends RouterRecord> = (
/**
 * @note
 * If passing a function, we recommend it's a cached function
 * e.g. wrapped in `React.cache` to avoid unnecessary computations
 */
ctx: TRoot['ctx'] | (() => MaybePromise<TRoot['ctx']>), options?: {
    onError?: RouterCallerErrorHandler<TRoot['ctx']>;
    signal?: AbortSignal;
}) => DecorateRouterRecord<TRecord>;
declare const lazySymbol: unique symbol;
export type Lazy<TAny> = (() => Promise<TAny>) & {
    [lazySymbol]: true;
};
type LazyLoader<TAny> = {
    load: () => Promise<void>;
    ref: Lazy<TAny>;
};
/**
 * Lazy load a router
 * @see https://trpc.io/docs/server/merging-routers#lazy-load
 */
export declare function lazy<TRouter extends AnyRouter>(importRouter: () => Promise<TRouter | {
    [key: string]: TRouter;
}>): Lazy<NoInfer<TRouter>>;
export interface Router<TRoot extends AnyRootTypes, TRecord extends RouterRecord> {
    _def: {
        _config: RootConfig<TRoot>;
        router: true;
        procedure?: never;
        procedures: TRecord;
        record: TRecord;
        lazy: Record<string, LazyLoader<AnyRouter>>;
    };
    /**
     * @see https://trpc.io/docs/v11/server/server-side-calls
     */
    createCaller: RouterCaller<TRoot, TRecord>;
}
export type BuiltRouter<TRoot extends AnyRootTypes, TDef extends RouterRecord> = Router<TRoot, TDef> & TDef;
export type AnyRouter = Router<any, any>;
export type inferRouterRootTypes<TRouter extends AnyRouter> = TRouter['_def']['_config']['$types'];
export type inferRouterContext<TRouter extends AnyRouter> = inferRouterRootTypes<TRouter>['ctx'];
export type inferRouterError<TRouter extends AnyRouter> = inferRouterRootTypes<TRouter>['errorShape'];
export type inferRouterMeta<TRouter extends AnyRouter> = inferRouterRootTypes<TRouter>['meta'];
export type CreateRouterOptions = {
    [key: string]: AnyProcedure | AnyRouter | CreateRouterOptions | Lazy<AnyRouter>;
};
export type DecorateCreateRouterOptions<TRouterOptions extends CreateRouterOptions> = {
    [K in keyof TRouterOptions]: TRouterOptions[K] extends infer $Value ? $Value extends AnyProcedure ? $Value : $Value extends Router<any, infer TRecord> ? TRecord : $Value extends Lazy<Router<any, infer TRecord>> ? TRecord : $Value extends CreateRouterOptions ? DecorateCreateRouterOptions<$Value> : never : never;
};
/**
 * @internal
 */
export declare function createRouterFactory<TRoot extends AnyRootTypes>(config: RootConfig<TRoot>): <TInput extends CreateRouterOptions>(input: TInput) => BuiltRouter<TRoot, DecorateCreateRouterOptions<TInput>>;
/**
 * @internal
 */
export declare function getProcedureAtPath(router: Pick<Router<any, any>, '_def'>, path: string): Promise<AnyProcedure | null>;
/**
 * @internal
 */
export declare function callProcedure(opts: ProcedureCallOptions<unknown> & {
    router: AnyRouter;
    allowMethodOverride?: boolean;
}): Promise<any>;
export declare function createCallerFactory<TRoot extends AnyRootTypes>(): <TRecord extends RouterRecord>(router: Pick<Router<TRoot, TRecord>, "_def">) => RouterCaller<TRoot, TRecord>;
/** @internal */
type MergeRouters<TRouters extends AnyRouter[], TRoot extends AnyRootTypes = TRouters[0]['_def']['_config']['$types'], TRecord extends RouterRecord = {}> = TRouters extends [
    infer Head extends AnyRouter,
    ...infer Tail extends AnyRouter[]
] ? MergeRouters<Tail, TRoot, Head['_def']['record'] & TRecord> : BuiltRouter<TRoot, TRecord>;
export declare function mergeRouters<TRouters extends AnyRouter[]>(...routerList: [...TRouters]): MergeRouters<TRouters>;
export {};
//# sourceMappingURL=router.d.ts.map