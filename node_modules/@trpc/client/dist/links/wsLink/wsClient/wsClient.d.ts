import type { AnyTRPCRouter } from '@trpc/server';
import type { BehaviorSubject } from '@trpc/server/observable';
import type { CombinedDataTransformer } from '@trpc/server/unstable-core-do-not-import';
import { TRPCClientError } from '../../../TRPCClientError';
import type { TRPCConnectionState } from '../../internals/subscriptions';
import type { Operation, OperationResultEnvelope } from '../../types';
import type { WebSocketClientOptions } from './options';
/**
 * A WebSocket client for managing TRPC operations, supporting lazy initialization,
 * reconnection, keep-alive, and request management.
 */
export declare class WsClient {
    /**
     * Observable tracking the current connection state, including errors.
     */
    readonly connectionState: BehaviorSubject<TRPCConnectionState<TRPCClientError<AnyTRPCRouter>>>;
    private allowReconnect;
    private requestManager;
    private readonly activeConnection;
    private readonly reconnectRetryDelay;
    private inactivityTimeout;
    private readonly callbacks;
    private readonly lazyMode;
    constructor(opts: WebSocketClientOptions);
    /**
     * Opens the WebSocket connection. Handles reconnection attempts and updates
     * the connection state accordingly.
     */
    private open;
    /**
     * Closes the WebSocket connection and stops managing requests.
     * Ensures all outgoing and pending requests are properly finalized.
     */
    close(): Promise<void>;
    /**
     * Method to request the server.
     * Handles data transformation, batching of requests, and subscription lifecycle.
     *
     * @param op - The operation details including id, type, path, input and signal
     * @param transformer - Data transformer for serializing requests and deserializing responses
     * @param lastEventId - Optional ID of the last received event for subscriptions
     *
     * @returns An observable that emits operation results and handles cleanup
     */
    request({ op: { id, type, path, input, signal }, transformer, lastEventId, }: {
        op: Pick<Operation, 'id' | 'type' | 'path' | 'input' | 'signal'>;
        transformer: CombinedDataTransformer;
        lastEventId?: string;
    }): import("@trpc/server/observable").Observable<OperationResultEnvelope<unknown, TRPCClientError<AnyTRPCRouter>>, TRPCClientError<AnyTRPCRouter>>;
    get connection(): {
        readonly id: number;
        readonly state: "open";
        readonly ws: WebSocket;
    } | {
        readonly id: number;
        readonly state: "closed";
        readonly ws: WebSocket;
    } | {
        readonly id: number;
        readonly state: "connecting";
        readonly ws: WebSocket;
    } | null;
    /**
     * Manages the reconnection process for the WebSocket using retry logic.
     * Ensures that only one reconnection attempt is active at a time by tracking the current
     * reconnection state in the `reconnecting` promise.
     */
    private reconnecting;
    private reconnect;
    private setupWebSocketListeners;
    private handleResponseMessage;
    private handleIncomingRequest;
    /**
     * Sends a message or batch of messages directly to the server.
     */
    private send;
    /**
     * Groups requests for batch sending.
     *
     * @returns A function to abort the batched request.
     */
    private batchSend;
}
//# sourceMappingURL=wsClient.d.ts.map