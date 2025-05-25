import { type AnyRouter } from '../router';
import type { TRPCRequestInfo } from './types';
type GetRequestInfoOptions = {
    path: string;
    req: Request;
    url: URL | null;
    searchParams: URLSearchParams;
    headers: Headers;
    router: AnyRouter;
};
export declare function getRequestInfo(opts: GetRequestInfoOptions): Promise<TRPCRequestInfo>;
export {};
//# sourceMappingURL=contentType.d.ts.map