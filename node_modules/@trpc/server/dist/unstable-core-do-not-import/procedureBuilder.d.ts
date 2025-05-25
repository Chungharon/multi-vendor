import type { inferObservableValue, Observable } from '../observable';
import type { AnyMiddlewareFunction, MiddlewareBuilder, MiddlewareFunction } from './middleware';
import type { inferParser, Parser } from './parser';
import type { AnyProcedure, LegacyObservableSubscriptionProcedure, MutationProcedure, ProcedureType, QueryProcedure, SubscriptionProcedure } from './procedure';
import type { inferTrackedOutput } from './stream/tracked';
import type { GetRawInputFn, MaybePromise, Overwrite, Simplify, TypeError } from './types';
import type { UnsetMarker } from './utils';
type IntersectIfDefined<TType, TWith> = TType extends UnsetMarker ? TWith : TWith extends UnsetMarker ? TType : Simplify<TType & TWith>;
type DefaultValue<TValue, TFallback> = TValue extends UnsetMarker ? TFallback : TValue;
type inferAsyncIterable<TOutput> = TOutput extends AsyncIterable<infer $Yield, infer $Return, infer $Next> ? {
    yield: $Yield;
    return: $Return;
    next: $Next;
} : never;
type inferSubscriptionOutput<TOutput> = TOutput extends AsyncIterable<any> ? AsyncIterable<inferTrackedOutput<inferAsyncIterable<TOutput>['yield']>, inferAsyncIterable<TOutput>['return'], inferAsyncIterable<TOutput>['next']> : TypeError<'Subscription output could not be inferred'>;
export type CallerOverride<TContext> = (opts: {
    args: unknown[];
    invoke: (opts: ProcedureCallOptions<TContext>) => Promise<unknown>;
    _def: AnyProcedure['_def'];
}) => Promise<unknown>;
type ProcedureBuilderDef<TMeta> = {
    procedure: true;
    inputs: Parser[];
    output?: Parser;
    meta?: TMeta;
    resolver?: ProcedureBuilderResolver;
    middlewares: AnyMiddlewareFunction[];
    /**
     * @deprecated use `type` instead
     */
    mutation?: boolean;
    /**
     * @deprecated use `type` instead
     */
    query?: boolean;
    /**
     * @deprecated use `type` instead
     */
    subscription?: boolean;
    type?: ProcedureType;
    caller?: CallerOverride<unknown>;
};
type AnyProcedureBuilderDef = ProcedureBuilderDef<any>;
/**
 * Procedure resolver options (what the `.query()`, `.mutation()`, and `.subscription()` functions receive)
 * @internal
 */
export interface ProcedureResolverOptions<TContext, _TMeta, TContextOverridesIn, TInputOut> {
    ctx: Simplify<Overwrite<TContext, TContextOverridesIn>>;
    input: TInputOut extends UnsetMarker ? undefined : TInputOut;
    /**
     * The AbortSignal of the request
     */
    signal: AbortSignal | undefined;
}
/**
 * A procedure resolver
 */
type ProcedureResolver<TContext, TMeta, TContextOverrides, TInputOut, TOutputParserIn, $Output> = (opts: ProcedureResolverOptions<TContext, TMeta, TContextOverrides, TInputOut>) => MaybePromise<DefaultValue<TOutputParserIn, $Output>>;
export type AnyProcedureBuilder = ProcedureBuilder<any, any, any, any, any, any, any, any>;
/**
 * Infer the context type from a procedure builder
 * Useful to create common helper functions for different procedures
 */
export type inferProcedureBuilderResolverOptions<TProcedureBuilder extends AnyProcedureBuilder> = TProcedureBuilder extends ProcedureBuilder<infer TContext, infer TMeta, infer TContextOverrides, infer _TInputIn, infer TInputOut, infer _TOutputIn, infer _TOutputOut, infer _TCaller> ? ProcedureResolverOptions<TContext, TMeta, TContextOverrides, TInputOut extends UnsetMarker ? unknown : TInputOut extends object ? Simplify<TInputOut & {
    /**
     * Extra input params might have been added by a `.input()` further down the chain
     */
    [keyAddedByInputCallFurtherDown: string]: unknown;
}> : TInputOut> : never;
export interface ProcedureBuilder<TContext, TMeta, TContextOverrides, TInputIn, TInputOut, TOutputIn, TOutputOut, TCaller extends boolean> {
    /**
     * Add an input parser to the procedure.
     * @see https://trpc.io/docs/v11/server/validators
     */
    input<$Parser extends Parser>(schema: TInputOut extends UnsetMarker ? $Parser : inferParser<$Parser>['out'] extends Record<string, unknown> | undefined ? TInputOut extends Record<string, unknown> | undefined ? undefined extends inferParser<$Parser>['out'] ? undefined extends TInputOut ? $Parser : TypeError<'Cannot chain an optional parser to a required parser'> : $Parser : TypeError<'All input parsers did not resolve to an object'> : TypeError<'All input parsers did not resolve to an object'>): ProcedureBuilder<TContext, TMeta, TContextOverrides, IntersectIfDefined<TInputIn, inferParser<$Parser>['in']>, IntersectIfDefined<TInputOut, inferParser<$Parser>['out']>, TOutputIn, TOutputOut, TCaller>;
    /**
     * Add an output parser to the procedure.
     * @see https://trpc.io/docs/v11/server/validators
     */
    output<$Parser extends Parser>(schema: $Parser): ProcedureBuilder<TContext, TMeta, TContextOverrides, TInputIn, TInputOut, IntersectIfDefined<TOutputIn, inferParser<$Parser>['in']>, IntersectIfDefined<TOutputOut, inferParser<$Parser>['out']>, TCaller>;
    /**
     * Add a meta data to the procedure.
     * @see https://trpc.io/docs/v11/server/metadata
     */
    meta(meta: TMeta): ProcedureBuilder<TContext, TMeta, TContextOverrides, TInputIn, TInputOut, TOutputIn, TOutputOut, TCaller>;
    /**
     * Add a middleware to the procedure.
     * @see https://trpc.io/docs/v11/server/middlewares
     */
    use<$ContextOverridesOut>(fn: MiddlewareBuilder<Overwrite<TContext, TContextOverrides>, TMeta, $ContextOverridesOut, TInputOut> | MiddlewareFunction<TContext, TMeta, TContextOverrides, $ContextOverridesOut, TInputOut>): ProcedureBuilder<TContext, TMeta, Overwrite<TContextOverrides, $ContextOverridesOut>, TInputIn, TInputOut, TOutputIn, TOutputOut, TCaller>;
    /**
     * @deprecated use {@link concat} instead
     */
    unstable_concat<$Context, $Meta, $ContextOverrides, $InputIn, $InputOut, $OutputIn, $OutputOut>(builder: Overwrite<TContext, TContextOverrides> extends $Context ? TMeta extends $Meta ? ProcedureBuilder<$Context, $Meta, $ContextOverrides, $InputIn, $InputOut, $OutputIn, $OutputOut, TCaller> : TypeError<'Meta mismatch'> : TypeError<'Context mismatch'>): ProcedureBuilder<TContext, TMeta, Overwrite<TContextOverrides, $ContextOverrides>, IntersectIfDefined<TInputIn, $InputIn>, IntersectIfDefined<TInputOut, $InputOut>, IntersectIfDefined<TOutputIn, $OutputIn>, IntersectIfDefined<TOutputOut, $OutputOut>, TCaller>;
    /**
     * Combine two procedure builders
     */
    concat<$Context, $Meta, $ContextOverrides, $InputIn, $InputOut, $OutputIn, $OutputOut>(builder: Overwrite<TContext, TContextOverrides> extends $Context ? TMeta extends $Meta ? ProcedureBuilder<$Context, $Meta, $ContextOverrides, $InputIn, $InputOut, $OutputIn, $OutputOut, TCaller> : TypeError<'Meta mismatch'> : TypeError<'Context mismatch'>): ProcedureBuilder<TContext, TMeta, Overwrite<TContextOverrides, $ContextOverrides>, IntersectIfDefined<TInputIn, $InputIn>, IntersectIfDefined<TInputOut, $InputOut>, IntersectIfDefined<TOutputIn, $OutputIn>, IntersectIfDefined<TOutputOut, $OutputOut>, TCaller>;
    /**
     * Query procedure
     * @see https://trpc.io/docs/v11/concepts#vocabulary
     */
    query<$Output>(resolver: ProcedureResolver<TContext, TMeta, TContextOverrides, TInputOut, TOutputIn, $Output>): TCaller extends true ? (input: DefaultValue<TInputIn, void>) => Promise<DefaultValue<TOutputOut, $Output>> : QueryProcedure<{
        input: DefaultValue<TInputIn, void>;
        output: DefaultValue<TOutputOut, $Output>;
    }>;
    /**
     * Mutation procedure
     * @see https://trpc.io/docs/v11/concepts#vocabulary
     */
    mutation<$Output>(resolver: ProcedureResolver<TContext, TMeta, TContextOverrides, TInputOut, TOutputIn, $Output>): TCaller extends true ? (input: DefaultValue<TInputIn, void>) => Promise<DefaultValue<TOutputOut, $Output>> : MutationProcedure<{
        input: DefaultValue<TInputIn, void>;
        output: DefaultValue<TOutputOut, $Output>;
    }>;
    /**
     * Subscription procedure
     * @see https://trpc.io/docs/v11/server/subscriptions
     */
    subscription<$Output extends AsyncIterable<any, void, any>>(resolver: ProcedureResolver<TContext, TMeta, TContextOverrides, TInputOut, TOutputIn, $Output>): TCaller extends true ? TypeError<'Not implemented'> : SubscriptionProcedure<{
        input: DefaultValue<TInputIn, void>;
        output: inferSubscriptionOutput<DefaultValue<TOutputOut, $Output>>;
    }>;
    /**
     * @deprecated Using subscriptions with an observable is deprecated. Use an async generator instead.
     * This feature will be removed in v12 of tRPC.
     * @see https://trpc.io/docs/v11/server/subscriptions
     */
    subscription<$Output extends Observable<any, any>>(resolver: ProcedureResolver<TContext, TMeta, TContextOverrides, TInputOut, TOutputIn, $Output>): TCaller extends true ? TypeError<'Not implemented'> : LegacyObservableSubscriptionProcedure<{
        input: DefaultValue<TInputIn, void>;
        output: inferObservableValue<DefaultValue<TOutputOut, $Output>>;
    }>;
    /**
     * Overrides the way a procedure is invoked
     * Do not use this unless you know what you're doing - this is an experimental API
     */
    experimental_caller(caller: CallerOverride<TContext>): ProcedureBuilder<TContext, TMeta, TContextOverrides, TInputIn, TInputOut, TOutputIn, TOutputOut, true>;
    /**
     * @internal
     */
    _def: ProcedureBuilderDef<TMeta>;
}
type ProcedureBuilderResolver = (opts: ProcedureResolverOptions<any, any, any, any>) => Promise<unknown>;
export declare function createBuilder<TContext, TMeta>(initDef?: Partial<AnyProcedureBuilderDef>): ProcedureBuilder<TContext, TMeta, object, UnsetMarker, UnsetMarker, UnsetMarker, UnsetMarker, false>;
/**
 * @internal
 */
export interface ProcedureCallOptions<TContext> {
    ctx: TContext;
    getRawInput: GetRawInputFn;
    input?: unknown;
    path: string;
    type: ProcedureType;
    signal: AbortSignal | undefined;
}
export {};
//# sourceMappingURL=procedureBuilder.d.ts.map