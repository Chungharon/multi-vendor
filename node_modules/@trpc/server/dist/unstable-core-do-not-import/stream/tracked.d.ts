declare const trackedSymbol: unique symbol;
type TrackedId = string & {
    __brand: 'TrackedId';
};
export type TrackedEnvelope<TData> = [TrackedId, TData, typeof trackedSymbol];
type TrackedData<TData> = {
    /**
     * The id of the message to keep track of in case the connection gets lost
     */
    id: string;
    /**
     * The data field of the message - this can be anything
     */
    data: TData;
};
/**
 * Produce a typed server-sent event message
 * @deprecated use `tracked(id, data)` instead
 */
export declare function sse<TData>(event: {
    id: string;
    data: TData;
}): TrackedEnvelope<TData>;
export declare function isTrackedEnvelope<TData>(value: unknown): value is TrackedEnvelope<TData>;
/**
 * Automatically track an event so that it can be resumed from a given id if the connection is lost
 */
export declare function tracked<TData>(id: string, data: TData): TrackedEnvelope<TData>;
export type inferTrackedOutput<TData> = TData extends TrackedEnvelope<infer $Data> ? TrackedData<$Data> : TData;
export {};
//# sourceMappingURL=tracked.d.ts.map