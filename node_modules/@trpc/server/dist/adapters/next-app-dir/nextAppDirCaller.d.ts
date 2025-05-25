import type { CreateContextCallback } from '../../@trpc/server';
import type { ErrorHandlerOptions } from '../../unstable-core-do-not-import/procedure';
import type { CallerOverride } from '../../unstable-core-do-not-import/procedureBuilder';
import type { MaybePromise, Simplify } from '../../unstable-core-do-not-import/types';
/**
 * Create a caller that works with Next.js React Server Components & Server Actions
 */
export declare function nextAppDirCaller<TContext, TMeta>(config: Simplify<{
    /**
     * Extract the path from the procedure metadata
     */
    pathExtractor?: (opts: {
        meta: TMeta;
    }) => string;
    /**
     * Transform form data to a `Record` before passing it to the procedure
     * @default true
     */
    normalizeFormData?: boolean;
    /**
     * Called when an error occurs in the handler
     */
    onError?: (opts: ErrorHandlerOptions<TContext>) => void;
} & CreateContextCallback<TContext, () => MaybePromise<TContext>>>): CallerOverride<TContext>;
//# sourceMappingURL=nextAppDirCaller.d.ts.map