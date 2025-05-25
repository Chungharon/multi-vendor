/**
 * Creates a ReadableStream from an AsyncIterable.
 *
 * @param iterable - The source AsyncIterable to stream from
 * @returns A ReadableStream that yields values from the AsyncIterable
 */
export declare function readableStreamFrom<TYield>(iterable: AsyncIterable<TYield, void>): ReadableStream<TYield>;
//# sourceMappingURL=readableStreamFrom.d.ts.map