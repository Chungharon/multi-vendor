import type { ProcedureType } from '../procedure';
import type { AnyRootTypes, RootConfig } from '../rootConfig';
import type { TRPCError } from './TRPCError';
/**
 * @internal
 */
export declare function getErrorShape<TRoot extends AnyRootTypes>(opts: {
    config: RootConfig<TRoot>;
    error: TRPCError;
    type: ProcedureType | 'unknown';
    path: string | undefined;
    input: unknown;
    ctx: TRoot['ctx'] | undefined;
}): TRoot['errorShape'];
//# sourceMappingURL=getErrorShape.d.ts.map