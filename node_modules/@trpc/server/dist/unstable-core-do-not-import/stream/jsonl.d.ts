/**
 * A subset of the standard ReadableStream properties needed by tRPC internally.
 * @see ReadableStream from lib.dom.d.ts
 */
export type WebReadableStreamEsque = {
    getReader: () => ReadableStreamDefaultReader<Uint8Array>;
};
export type NodeJSReadableStreamEsque = {
    on(eventName: string | symbol, listener: (...args: any[]) => void): NodeJSReadableStreamEsque;
};
declare const CHUNK_VALUE_TYPE_PROMISE = 0;
type CHUNK_VALUE_TYPE_PROMISE = typeof CHUNK_VALUE_TYPE_PROMISE;
declare const CHUNK_VALUE_TYPE_ASYNC_ITERABLE = 1;
type CHUNK_VALUE_TYPE_ASYNC_ITERABLE = typeof CHUNK_VALUE_TYPE_ASYNC_ITERABLE;
declare const PROMISE_STATUS_FULFILLED = 0;
type PROMISE_STATUS_FULFILLED = typeof PROMISE_STATUS_FULFILLED;
declare const PROMISE_STATUS_REJECTED = 1;
type PROMISE_STATUS_REJECTED = typeof PROMISE_STATUS_REJECTED;
declare const ASYNC_ITERABLE_STATUS_RETURN = 0;
type ASYNC_ITERABLE_STATUS_RETURN = typeof ASYNC_ITERABLE_STATUS_RETURN;
declare const ASYNC_ITERABLE_STATUS_YIELD = 1;
type ASYNC_ITERABLE_STATUS_YIELD = typeof ASYNC_ITERABLE_STATUS_YIELD;
declare const ASYNC_ITERABLE_STATUS_ERROR = 2;
type ASYNC_ITERABLE_STATUS_ERROR = typeof ASYNC_ITERABLE_STATUS_ERROR;
type ChunkDefinitionKey = null | number | string;
type ChunkIndex = number & {
    __chunkIndex: true;
};
type ChunkValueType = CHUNK_VALUE_TYPE_PROMISE | CHUNK_VALUE_TYPE_ASYNC_ITERABLE;
type ChunkDefinition = [
    key: ChunkDefinitionKey,
    type: ChunkValueType,
    chunkId: ChunkIndex
];
type EncodedValue = [
    [
        unknown
    ] | [],
    ...ChunkDefinition[]
];
type PromiseChunk = [
    chunkIndex: ChunkIndex,
    status: PROMISE_STATUS_FULFILLED,
    value: EncodedValue
] | [chunkIndex: ChunkIndex, status: PROMISE_STATUS_REJECTED, error: unknown];
type IterableChunk = [
    chunkIndex: ChunkIndex,
    status: ASYNC_ITERABLE_STATUS_RETURN,
    value: EncodedValue
] | [
    chunkIndex: ChunkIndex,
    status: ASYNC_ITERABLE_STATUS_YIELD,
    value: EncodedValue
] | [
    chunkIndex: ChunkIndex,
    status: ASYNC_ITERABLE_STATUS_ERROR,
    error: unknown
];
type ChunkData = PromiseChunk | IterableChunk;
export declare function isPromise(value: unknown): value is Promise<unknown>;
type Serialize = (value: any) => any;
type Deserialize = (value: any) => any;
type PathArray = readonly (string | number)[];
export type ProducerOnError = (opts: {
    error: unknown;
    path: PathArray;
}) => void;
export interface JSONLProducerOptions {
    serialize?: Serialize;
    data: Record<string, unknown> | unknown[];
    onError?: ProducerOnError;
    formatError?: (opts: {
        error: unknown;
        path: PathArray;
    }) => unknown;
    maxDepth?: number;
    /**
     * Interval in milliseconds to send a ping to the client to keep the connection alive
     * This will be sent as a whitespace character
     * @default undefined
     */
    pingMs?: number;
}
/**
 * JSON Lines stream producer
 * @see https://jsonlines.org/
 */
export declare function jsonlStreamProducer(opts: JSONLProducerOptions): ReadableStream<Uint8Array<ArrayBufferLike>>;
export type ConsumerOnError = (opts: {
    error: unknown;
}) => void;
/**
 * JSON Lines stream consumer
 * @see https://jsonlines.org/
 */
export declare function jsonlStreamConsumer<THead>(opts: {
    from: NodeJSReadableStreamEsque | WebReadableStreamEsque;
    deserialize?: Deserialize;
    onError?: ConsumerOnError;
    formatError?: (opts: {
        error: unknown;
    }) => Error;
    /**
     * This `AbortController` will be triggered when there are no more listeners to the stream.
     */
    abortController: AbortController;
}): Promise<readonly [Awaited<THead>, {
    getOrCreate: (chunkId: ChunkIndex) => {
        enqueue: (v: ChunkData) => void;
        close: () => void;
        closed: boolean;
        getReaderResource: () => ReadableStreamDefaultReader<ChunkData> & Disposable;
        error: (reason: unknown) => void;
    };
    isEmpty: () => boolean;
    cancelAll: (reason: unknown) => void;
}]>;
export {};
//# sourceMappingURL=jsonl.d.ts.map