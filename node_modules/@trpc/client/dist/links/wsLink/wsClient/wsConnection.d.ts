import type { UrlOptionsWithConnectionParams } from '../../internals/urlWithConnectionParams';
interface PingPongOptions {
    /**
     * The interval (in milliseconds) between "PING" messages.
     */
    intervalMs: number;
    /**
     * The timeout (in milliseconds) to wait for a "PONG" response before closing the connection.
     */
    pongTimeoutMs: number;
}
export interface WebSocketConnectionOptions {
    WebSocketPonyfill?: typeof WebSocket;
    urlOptions: UrlOptionsWithConnectionParams;
    keepAlive: PingPongOptions & {
        enabled: boolean;
    };
}
/**
 * Manages a WebSocket connection with support for reconnection, keep-alive mechanisms,
 * and observable state tracking.
 */
export declare class WsConnection {
    static connectCount: number;
    id: number;
    private readonly WebSocketPonyfill;
    private readonly urlOptions;
    private readonly keepAliveOpts;
    readonly wsObservable: import("@trpc/server/observable").BehaviorSubject<WebSocket | null>;
    constructor(opts: WebSocketConnectionOptions);
    get ws(): WebSocket | null;
    private set ws(value);
    /**
     * Checks if the WebSocket connection is open and ready to communicate.
     */
    isOpen(): this is {
        ws: WebSocket;
    };
    /**
     * Checks if the WebSocket connection is closed or in the process of closing.
     */
    isClosed(): this is {
        ws: WebSocket;
    };
    /**
     * Manages the WebSocket opening process, ensuring that only one open operation
     * occurs at a time. Tracks the ongoing operation with `openPromise` to avoid
     * redundant calls and ensure proper synchronization.
     *
     * Sets up the keep-alive mechanism and necessary event listeners for the connection.
     *
     * @returns A promise that resolves once the WebSocket connection is successfully opened.
     */
    private openPromise;
    open(): Promise<void>;
    /**
     * Closes the WebSocket connection gracefully.
     * Waits for any ongoing open operation to complete before closing.
     */
    close(): Promise<void>;
}
/**
 * Provides a backward-compatible representation of the connection state.
 */
export declare function backwardCompatibility(connection: WsConnection): {
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
export {};
//# sourceMappingURL=wsConnection.d.ts.map