export declare function iteratorResource<TYield, TReturn, TNext>(iterable: AsyncIterable<TYield, TReturn, TNext>): AsyncIterator<TYield, TReturn, TNext> & AsyncDisposable;
/**
 * Derives a new {@link AsyncGenerator} based on {@link iterable}, that automatically aborts after the specified duration.
 */
export declare function withMaxDuration<T>(iterable: AsyncIterable<T>, opts: {
    maxDurationMs: number;
}): AsyncGenerator<T>;
/**
 * Derives a new {@link AsyncGenerator} based of {@link iterable}, that yields its first
 * {@link count} values. Then, a grace period of {@link gracePeriodMs} is started in which further
 * values may still come through. After this period, the generator aborts.
 */
export declare function takeWithGrace<T>(iterable: AsyncIterable<T>, opts: {
    count: number;
    gracePeriodMs: number;
}): AsyncGenerator<T>;
//# sourceMappingURL=asyncIterable.d.ts.map