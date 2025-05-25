import type { RedirectType } from 'next/navigation';
import { TRPCError } from '../../@trpc/server';
/**
 * @internal
 */
export declare class TRPCRedirectError extends TRPCError {
    readonly args: readonly [string, RedirectType | undefined];
    constructor(url: URL | string, redirectType?: RedirectType);
}
/**
 * Like `next/navigation`'s `redirect()` but throws a `TRPCError` that later will be handled by Next.js
 * This provides better typesafety than the `next/navigation`'s `redirect()` since the action continues
 * to execute on the frontend even if Next's `redirect()` has a return type of `never`.
 * @public
 * @remark You should only use this if you're also using `nextAppDirCaller`.
 */
export declare const redirect: (url: URL | string, redirectType?: RedirectType) => undefined;
//# sourceMappingURL=redirect.d.ts.map