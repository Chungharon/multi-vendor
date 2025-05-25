import { TRPCError } from '../error/TRPCError';
import { type AnyRouter } from '../router';
import type { HTTPBaseHandlerOptions, ResolveHTTPRequestOptionsContextFn } from './types';
interface ResolveHTTPRequestOptions<TRouter extends AnyRouter> extends HTTPBaseHandlerOptions<TRouter, Request> {
    createContext: ResolveHTTPRequestOptionsContextFn<TRouter>;
    req: Request;
    path: string;
    /**
     * If the request had an issue before reaching the handler
     */
    error: TRPCError | null;
}
export declare function resolveResponse<TRouter extends AnyRouter>(opts: ResolveHTTPRequestOptions<TRouter>): Promise<Response>;
export {};
//# sourceMappingURL=resolveResponse.d.ts.map