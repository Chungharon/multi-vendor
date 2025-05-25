'use strict';

/**
 * Creates a ReadableStream from an AsyncIterable.
 *
 * @param iterable - The source AsyncIterable to stream from
 * @returns A ReadableStream that yields values from the AsyncIterable
 */ function readableStreamFrom(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    return new ReadableStream({
        async cancel () {
            await iterator.return?.();
        },
        async pull (controller) {
            const result = await iterator.next();
            if (result.done) {
                controller.close();
                return;
            }
            controller.enqueue(result.value);
        }
    });
}

exports.readableStreamFrom = readableStreamFrom;
