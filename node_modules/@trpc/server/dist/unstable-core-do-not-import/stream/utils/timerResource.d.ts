export declare const disposablePromiseTimerResult: unique symbol;
export declare function timerResource(ms: number): {
    start(): Promise<typeof disposablePromiseTimerResult>;
} & Disposable;
//# sourceMappingURL=timerResource.d.ts.map