interface MergedAsyncIterables<TYield> extends AsyncIterable<TYield, void, unknown> {
    add(iterable: AsyncIterable<TYield>): void;
}
/**
 * Creates a new async iterable that merges multiple async iterables into a single stream.
 * Values from the input iterables are yielded in the order they resolve, similar to Promise.race().
 *
 * New iterables can be added dynamically using the returned {@link MergedAsyncIterables.add} method, even after iteration has started.
 *
 * If any of the input iterables throws an error, that error will be propagated through the merged stream.
 * Other iterables will not continue to be processed.
 *
 * @template TYield The type of values yielded by the input iterables
 */
export declare function mergeAsyncIterables<TYield>(): MergedAsyncIterables<TYield>;
export {};
//# sourceMappingURL=mergeAsyncIterables.d.ts.map