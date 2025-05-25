'use strict';

var observable = require('@trpc/server/observable');
var utils = require('./utils.js');

function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * Opens a WebSocket connection asynchronously and returns a promise
 * that resolves when the connection is successfully established.
 * The promise rejects if an error occurs during the connection attempt.
 */ function asyncWsOpen(ws) {
    const { promise, resolve, reject } = utils.withResolvers();
    ws.addEventListener('open', ()=>{
        ws.removeEventListener('error', reject);
        resolve();
    });
    ws.addEventListener('error', reject);
    return promise;
}
/**
 * Sets up a periodic ping-pong mechanism to keep the WebSocket connection alive.
 *
 * - Sends "PING" messages at regular intervals defined by `intervalMs`.
 * - If a "PONG" response is not received within the `pongTimeoutMs`, the WebSocket is closed.
 * - The ping timer resets upon receiving any message to maintain activity.
 * - Automatically starts the ping process when the WebSocket connection is opened.
 * - Cleans up timers when the WebSocket is closed.
 *
 * @param ws - The WebSocket instance to manage.
 * @param options - Configuration options for ping-pong intervals and timeouts.
 */ function setupPingInterval(ws, { intervalMs, pongTimeoutMs }) {
    let pingTimeout;
    let pongTimeout;
    function start() {
        pingTimeout = setTimeout(()=>{
            ws.send('PING');
            pongTimeout = setTimeout(()=>{
                ws.close();
            }, pongTimeoutMs);
        }, intervalMs);
    }
    function reset() {
        clearTimeout(pingTimeout);
        start();
    }
    function pong() {
        clearTimeout(pongTimeout);
        reset();
    }
    ws.addEventListener('open', start);
    ws.addEventListener('message', ({ data })=>{
        clearTimeout(pingTimeout);
        start();
        if (data === 'PONG') {
            pong();
        }
    });
    ws.addEventListener('close', ()=>{
        clearTimeout(pingTimeout);
        clearTimeout(pongTimeout);
    });
}
/**
 * Manages a WebSocket connection with support for reconnection, keep-alive mechanisms,
 * and observable state tracking.
 */ class WsConnection {
    get ws() {
        return this.wsObservable.get();
    }
    set ws(ws) {
        this.wsObservable.next(ws);
    }
    /**
   * Checks if the WebSocket connection is open and ready to communicate.
   */ isOpen() {
        return !!this.ws && this.ws.readyState === this.WebSocketPonyfill.OPEN && !this.openPromise;
    }
    /**
   * Checks if the WebSocket connection is closed or in the process of closing.
   */ isClosed() {
        return !!this.ws && (this.ws.readyState === this.WebSocketPonyfill.CLOSING || this.ws.readyState === this.WebSocketPonyfill.CLOSED);
    }
    async open() {
        if (this.openPromise) return this.openPromise;
        this.id = ++WsConnection.connectCount;
        const wsPromise = utils.prepareUrl(this.urlOptions).then((url)=>new this.WebSocketPonyfill(url));
        this.openPromise = wsPromise.then(async (ws)=>{
            this.ws = ws;
            // Setup ping listener
            ws.addEventListener('message', function({ data }) {
                if (data === 'PING') {
                    this.send('PONG');
                }
            });
            if (this.keepAliveOpts.enabled) {
                setupPingInterval(ws, this.keepAliveOpts);
            }
            ws.addEventListener('close', ()=>{
                if (this.ws === ws) {
                    this.ws = null;
                }
            });
            await asyncWsOpen(ws);
            if (this.urlOptions.connectionParams) {
                ws.send(await utils.buildConnectionMessage(this.urlOptions.connectionParams));
            }
        });
        try {
            await this.openPromise;
        } finally{
            this.openPromise = null;
        }
    }
    /**
   * Closes the WebSocket connection gracefully.
   * Waits for any ongoing open operation to complete before closing.
   */ async close() {
        try {
            await this.openPromise;
        } finally{
            this.ws?.close();
        }
    }
    constructor(opts){
        _define_property(this, "id", ++WsConnection.connectCount);
        _define_property(this, "WebSocketPonyfill", void 0);
        _define_property(this, "urlOptions", void 0);
        _define_property(this, "keepAliveOpts", void 0);
        _define_property(this, "wsObservable", observable.behaviorSubject(null));
        /**
   * Manages the WebSocket opening process, ensuring that only one open operation
   * occurs at a time. Tracks the ongoing operation with `openPromise` to avoid
   * redundant calls and ensure proper synchronization.
   *
   * Sets up the keep-alive mechanism and necessary event listeners for the connection.
   *
   * @returns A promise that resolves once the WebSocket connection is successfully opened.
   */ _define_property(this, "openPromise", null);
        this.WebSocketPonyfill = opts.WebSocketPonyfill ?? WebSocket;
        if (!this.WebSocketPonyfill) {
            throw new Error("No WebSocket implementation found - you probably don't want to use this on the server, but if you do you need to pass a `WebSocket`-ponyfill");
        }
        this.urlOptions = opts.urlOptions;
        this.keepAliveOpts = opts.keepAlive;
    }
}
_define_property(WsConnection, "connectCount", 0);
/**
 * Provides a backward-compatible representation of the connection state.
 */ function backwardCompatibility(connection) {
    if (connection.isOpen()) {
        return {
            id: connection.id,
            state: 'open',
            ws: connection.ws
        };
    }
    if (connection.isClosed()) {
        return {
            id: connection.id,
            state: 'closed',
            ws: connection.ws
        };
    }
    if (!connection.ws) {
        return null;
    }
    return {
        id: connection.id,
        state: 'connecting',
        ws: connection.ws
    };
}

exports.WsConnection = WsConnection;
exports.backwardCompatibility = backwardCompatibility;
