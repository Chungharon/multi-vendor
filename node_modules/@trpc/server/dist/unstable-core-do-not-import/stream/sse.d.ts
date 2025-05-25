import type { MaybePromise } from '../types';
import type { EventSourceLike } from './sse.types';
import type { inferTrackedOutput } from './tracked';
type Serialize = (value: any) => any;
type Deserialize = (value: any) => any;
/**
 * @internal
 */
export interface SSEPingOptions {
    /**
     * Enable ping comments sent from the server
     * @default false
     */
    enabled: boolean;
    /**
     * Interval in milliseconds
     * @default 1000
     */
    intervalMs?: number;
}
export interface SSEClientOptions {
    /**
     * Timeout and reconnect after inactivity in milliseconds
     * @default undefined
     */
    reconnectAfterInactivityMs?: number;
}
export interface SSEStreamProducerOptions<TValue = unknown> {
    serialize?: Serialize;
    data: AsyncIterable<TValue>;
    maxDepth?: number;
    ping?: SSEPingOptions;
    /**
     * Maximum duration in milliseconds for the request before ending the stream
     * @default undefined
     */
    maxDurationMs?: number;
    /**
     * End the request immediately after data is sent
     * Only useful for serverless runtimes that do not support streaming responses
     * @default false
     */
    emitAndEndImmediately?: boolean;
    formatError?: (opts: {
        error: unknown;
    }) => unknown;
    /**
     * Client-specific options - these will be sent to the client as part of the first message
     * @default {}
     */
    client?: SSEClientOptions;
}
/**
 *
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */
export declare function sseStreamProducer<TValue = unknown>(opts: SSEStreamProducerOptions<TValue>): ReadableStream<Uint8Array<ArrayBufferLike>>;
interface ConsumerStreamResultBase<TConfig extends ConsumerConfig> {
    eventSource: InstanceType<TConfig['EventSource']> | null;
}
interface ConsumerStreamResultData<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'data';
    data: inferTrackedOutput<TConfig['data']>;
}
interface ConsumerStreamResultError<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'serialized-error';
    error: TConfig['error'];
}
interface ConsumerStreamResultConnecting<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'connecting';
    event: EventSourceLike.EventOf<TConfig['EventSource']> | null;
}
interface ConsumerStreamResultTimeout<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'timeout';
    ms: number;
}
interface ConsumerStreamResultPing<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'ping';
}
interface ConsumerStreamResultConnected<TConfig extends ConsumerConfig> extends ConsumerStreamResultBase<TConfig> {
    type: 'connected';
    options: SSEClientOptions;
}
type ConsumerStreamResult<TConfig extends ConsumerConfig> = ConsumerStreamResultData<TConfig> | ConsumerStreamResultError<TConfig> | ConsumerStreamResultConnecting<TConfig> | ConsumerStreamResultTimeout<TConfig> | ConsumerStreamResultPing<TConfig> | ConsumerStreamResultConnected<TConfig>;
export interface SSEStreamConsumerOptions<TConfig extends ConsumerConfig> {
    url: () => MaybePromise<string>;
    init: () => MaybePromise<EventSourceLike.InitDictOf<TConfig['EventSource']>> | undefined;
    signal: AbortSignal;
    deserialize?: Deserialize;
    EventSource: TConfig['EventSource'];
}
interface ConsumerConfig {
    data: unknown;
    error: unknown;
    EventSource: EventSourceLike.AnyConstructor;
}
/**
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html
 */
export declare function sseStreamConsumer<TConfig extends ConsumerConfig>(opts: SSEStreamConsumerOptions<TConfig>): AsyncIterable<ConsumerStreamResult<TConfig>>;
export declare const sseHeaders: {
    readonly 'Content-Type': "text/event-stream";
    readonly 'Cache-Control': "no-cache, no-transform";
    readonly 'X-Accel-Buffering': "no";
    readonly Connection: "keep-alive";
};
export {};
//# sourceMappingURL=sse.d.ts.map