import type { Unsubscribable } from '@trpc/server/observable';
import type { AnyProcedure, AnyRouter, inferClientTypes, inferProcedureInput, InferrableClientTypes, inferTransformedProcedureOutput, ProcedureType, RouterRecord } from '@trpc/server/unstable-core-do-not-import';
import type { CreateTRPCClientOptions } from './createTRPCUntypedClient';
import type { TRPCSubscriptionObserver } from './internals/TRPCUntypedClient';
import { TRPCUntypedClient } from './internals/TRPCUntypedClient';
import type { TRPCProcedureOptions } from './internals/types';
import type { TRPCClientError } from './TRPCClientError';
/**
 * @public
 * @deprecated use {@link TRPCClient} instead, will be removed in v12
 **/
export type inferRouterClient<TRouter extends AnyRouter> = TRPCClient<TRouter>;
/**
 * @public
 * @deprecated use {@link TRPCClient} instead, will be removed in v12
 **/
export type CreateTRPCClient<TRouter extends AnyRouter> = TRPCClient<TRouter>;
declare const untypedClientSymbol: unique symbol;
/**
 * @public
 **/
export type TRPCClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<{
    transformer: TRouter['_def']['_config']['$types']['transformer'];
    errorShape: TRouter['_def']['_config']['$types']['errorShape'];
}, TRouter['_def']['record']> & {
    [untypedClientSymbol]: TRPCUntypedClient<TRouter>;
};
type ResolverDef = {
    input: any;
    output: any;
    transformer: boolean;
    errorShape: any;
};
type coerceAsyncGeneratorToIterable<T> = T extends AsyncGenerator<infer $T, infer $Return, infer $Next> ? AsyncIterable<$T, $Return, $Next> : T;
/** @internal */
export type Resolver<TDef extends ResolverDef> = (input: TDef['input'], opts?: TRPCProcedureOptions) => Promise<coerceAsyncGeneratorToIterable<TDef['output']>>;
type SubscriptionResolver<TDef extends ResolverDef> = (input: TDef['input'], opts: Partial<TRPCSubscriptionObserver<TDef['output'], TRPCClientError<TDef>>> & TRPCProcedureOptions) => Unsubscribable;
type DecorateProcedure<TType extends ProcedureType, TDef extends ResolverDef> = TType extends 'query' ? {
    query: Resolver<TDef>;
} : TType extends 'mutation' ? {
    mutate: Resolver<TDef>;
} : TType extends 'subscription' ? {
    subscribe: SubscriptionResolver<TDef>;
} : never;
/**
 * @internal
 */
type DecoratedProcedureRecord<TRoot extends InferrableClientTypes, TRecord extends RouterRecord> = {
    [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value ? $Value extends AnyProcedure ? DecorateProcedure<$Value['_def']['type'], {
        input: inferProcedureInput<$Value>;
        output: inferTransformedProcedureOutput<inferClientTypes<TRoot>, $Value>;
        errorShape: inferClientTypes<TRoot>['errorShape'];
        transformer: inferClientTypes<TRoot>['transformer'];
    }> : $Value extends RouterRecord ? DecoratedProcedureRecord<TRoot, $Value> : never : never;
};
/** @internal */
export declare const clientCallTypeToProcedureType: (clientCallType: string) => ProcedureType;
/**
 * @internal
 */
export declare function createTRPCClientProxy<TRouter extends AnyRouter>(client: TRPCUntypedClient<TRouter>): TRPCClient<TRouter>;
export declare function createTRPCClient<TRouter extends AnyRouter>(opts: CreateTRPCClientOptions<TRouter>): TRPCClient<TRouter>;
/**
 * Get an untyped client from a proxy client
 * @internal
 */
export declare function getUntypedClient<TRouter extends AnyRouter>(client: TRPCClient<TRouter>): TRPCUntypedClient<TRouter>;
export {};
//# sourceMappingURL=createTRPCClient.d.ts.map