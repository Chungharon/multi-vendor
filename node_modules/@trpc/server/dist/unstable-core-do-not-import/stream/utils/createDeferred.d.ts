export declare function createDeferred<TValue = void>(): {
    promise: Promise<TValue>;
    resolve: (value: TValue) => void;
    reject: (error: unknown) => void;
};
export type Deferred<TValue> = ReturnType<typeof createDeferred<TValue>>;
//# sourceMappingURL=createDeferred.d.ts.map