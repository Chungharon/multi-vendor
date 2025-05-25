import type { AnyRootTypes, RootConfig } from './rootConfig';
import type { AnyRouter, inferRouterError } from './router';
import type { TRPCResponse, TRPCResponseMessage, TRPCResultMessage } from './rpc';
/**
 * @public
 */
export interface DataTransformer {
    serialize: (object: any) => any;
    deserialize: (object: any) => any;
}
interface InputDataTransformer extends DataTransformer {
    /**
     * This function runs **on the client** before sending the data to the server.
     */
    serialize: (object: any) => any;
    /**
     * This function runs **on the server** to transform the data before it is passed to the resolver
     */
    deserialize: (object: any) => any;
}
interface OutputDataTransformer extends DataTransformer {
    /**
     * This function runs **on the server** before sending the data to the client.
     */
    serialize: (object: any) => any;
    /**
     * This function runs **only on the client** to transform the data sent from the server.
     */
    deserialize: (object: any) => any;
}
/**
 * @public
 */
export interface CombinedDataTransformer {
    /**
     * Specify how the data sent from the client to the server should be transformed.
     */
    input: InputDataTransformer;
    /**
     * Specify how the data sent from the server to the client should be transformed.
     */
    output: OutputDataTransformer;
}
/**
 * @public
 */
export type CombinedDataTransformerClient = {
    input: Pick<CombinedDataTransformer['input'], 'serialize'>;
    output: Pick<CombinedDataTransformer['output'], 'deserialize'>;
};
/**
 * @public
 */
export type DataTransformerOptions = CombinedDataTransformer | DataTransformer;
/**
 * @internal
 */
export declare function getDataTransformer(transformer: DataTransformerOptions): CombinedDataTransformer;
/**
 * @internal
 */
export declare const defaultTransformer: CombinedDataTransformer;
/**
 * Takes a unserialized `TRPCResponse` and serializes it with the router's transformers
 **/
export declare function transformTRPCResponse<TResponse extends TRPCResponse | TRPCResponse[] | TRPCResponseMessage | TRPCResponseMessage[]>(config: RootConfig<AnyRootTypes>, itemOrItems: TResponse): import("./rpc").TRPCSuccessResponse<unknown> | import("./rpc").TRPCErrorResponse<import("./rpc").TRPCErrorShape<object>> | ({
    id: import("./rpc").JSONRPC2.RequestId;
} & TRPCResultMessage<unknown>) | (TRPCResponse | TRPCResponseMessage)[];
/** @internal */
declare function transformResultInner<TRouter extends AnyRouter, TOutput>(response: TRPCResponse<TOutput, inferRouterError<TRouter>> | TRPCResponseMessage<TOutput, inferRouterError<TRouter>>, transformer: DataTransformer): {
    readonly ok: false;
    readonly error: {
        readonly error: inferRouterError<TRouter>;
        readonly id?: import("./rpc").JSONRPC2.RequestId;
        readonly jsonrpc?: "2.0";
    } | {
        readonly error: inferRouterError<TRouter>;
        readonly id: string | number | null;
        readonly jsonrpc?: "2.0";
    };
    readonly result?: undefined;
} | {
    readonly ok: true;
    readonly result: {
        type: "started";
        data?: never;
    } | {
        type: "stopped";
        data?: never;
    } | import("./rpc").TRPCResult<TOutput>;
    readonly error?: undefined;
};
/**
 * Transforms and validates that the result is a valid TRPCResponse
 * @internal
 */
export declare function transformResult<TRouter extends AnyRouter, TOutput>(response: TRPCResponse<TOutput, inferRouterError<TRouter>> | TRPCResponseMessage<TOutput, inferRouterError<TRouter>>, transformer: DataTransformer): ReturnType<typeof transformResultInner>;
export {};
//# sourceMappingURL=transformer.d.ts.map