import type { AnyClientTypes, CombinedDataTransformer, Maybe, ProcedureType, TRPCAcceptHeader, TRPCResponse } from '@trpc/server/unstable-core-do-not-import';
import type { FetchEsque, RequestInitEsque, ResponseEsque } from '../../internals/types';
import type { TransformerOptions } from '../../unstable-internals';
import type { HTTPHeaders } from '../types';
/**
 * @internal
 */
export type HTTPLinkBaseOptions<TRoot extends Pick<AnyClientTypes, 'transformer'>> = {
    url: string | URL;
    /**
     * Add ponyfill for fetch
     */
    fetch?: FetchEsque;
    /**
     * Send all requests `as POST`s requests regardless of the procedure type
     * The HTTP handler must separately allow overriding the method. See:
     * @see https://trpc.io/docs/rpc
     */
    methodOverride?: 'POST';
} & TransformerOptions<TRoot>;
export interface ResolvedHTTPLinkOptions {
    url: string;
    fetch?: FetchEsque;
    transformer: CombinedDataTransformer;
    methodOverride?: 'POST';
}
export declare function resolveHTTPLinkOptions(opts: HTTPLinkBaseOptions<AnyClientTypes>): ResolvedHTTPLinkOptions;
export interface HTTPResult {
    json: TRPCResponse;
    meta: {
        response: ResponseEsque;
        responseJSON?: unknown;
    };
}
type GetInputOptions = {
    transformer: CombinedDataTransformer;
} & ({
    input: unknown;
} | {
    inputs: unknown[];
});
export declare function getInput(opts: GetInputOptions): any;
export type HTTPBaseRequestOptions = GetInputOptions & ResolvedHTTPLinkOptions & {
    type: ProcedureType;
    path: string;
    signal: Maybe<AbortSignal>;
};
type GetUrl = (opts: HTTPBaseRequestOptions) => string;
type GetBody = (opts: HTTPBaseRequestOptions) => RequestInitEsque['body'];
export type ContentOptions = {
    trpcAcceptHeader?: TRPCAcceptHeader;
    contentTypeHeader?: string;
    getUrl: GetUrl;
    getBody: GetBody;
};
export declare const getUrl: GetUrl;
export declare const getBody: GetBody;
export type Requester = (opts: HTTPBaseRequestOptions & {
    headers: () => HTTPHeaders | Promise<HTTPHeaders>;
}) => Promise<HTTPResult>;
export declare const jsonHttpRequester: Requester;
export type HTTPRequestOptions = ContentOptions & HTTPBaseRequestOptions & {
    headers: () => HTTPHeaders | Promise<HTTPHeaders>;
};
export declare function fetchHTTPResponse(opts: HTTPRequestOptions): Promise<ResponseEsque>;
export declare function httpRequest(opts: HTTPRequestOptions): Promise<HTTPResult>;
export {};
//# sourceMappingURL=httpUtils.d.ts.map