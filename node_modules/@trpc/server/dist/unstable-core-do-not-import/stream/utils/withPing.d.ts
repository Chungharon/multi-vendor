export declare const PING_SYM: unique symbol;
/**
 * Derives a new {@link AsyncGenerator} based of {@link iterable}, that yields {@link PING_SYM}
 * whenever no value has been yielded for {@link pingIntervalMs}.
 */
export declare function withPing<TValue>(iterable: AsyncIterable<TValue>, pingIntervalMs: number): AsyncGenerator<TValue | typeof PING_SYM>;
//# sourceMappingURL=withPing.d.ts.map