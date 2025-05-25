import type { StandardSchemaV1 } from "./spec";
/** A schema error with useful information. */
export declare class StandardSchemaV1Error extends Error {
    /** The schema issues. */
    readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;
    /**
     * Creates a schema error with useful information.
     *
     * @param issues The schema issues.
     */
    constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>);
}
//# sourceMappingURL=error.d.ts.map