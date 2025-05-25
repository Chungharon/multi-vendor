import type { IncomingMessage } from 'http';
import type ws from 'ws';
import type { AnyRouter, CreateContextCallback, inferRouterContext } from '../@trpc/server';
import { type BaseHandlerOptions } from '../@trpc/server/http';
import { type MaybePromise } from '../unstable-core-do-not-import';
import { type NodeHTTPCreateContextFnOptions } from './node-http';
/**
 * @public
 */
export type CreateWSSContextFnOptions = NodeHTTPCreateContextFnOptions<IncomingMessage, ws.WebSocket>;
/**
 * @public
 */
export type CreateWSSContextFn<TRouter extends AnyRouter> = (opts: CreateWSSContextFnOptions) => MaybePromise<inferRouterContext<TRouter>>;
export type WSConnectionHandlerOptions<TRouter extends AnyRouter> = BaseHandlerOptions<TRouter, IncomingMessage> & CreateContextCallback<inferRouterContext<TRouter>, CreateWSSContextFn<TRouter>>;
/**
 * Web socket server handler
 */
export type WSSHandlerOptions<TRouter extends AnyRouter> = WSConnectionHandlerOptions<TRouter> & {
    wss: ws.WebSocketServer;
    prefix?: string;
    keepAlive?: {
        /**
         * Enable heartbeat messages
         * @default false
         */
        enabled: boolean;
        /**
         * Heartbeat interval in milliseconds
         * @default 30_000
         */
        pingMs?: number;
        /**
         * Terminate the WebSocket if no pong is received after this many milliseconds
         * @default 5_000
         */
        pongWaitMs?: number;
    };
    /**
     * Disable responding to ping messages from the client
     * **Not recommended** - this is mainly used for testing
     * @default false
     */
    dangerouslyDisablePong?: boolean;
};
export declare function getWSConnectionHandler<TRouter extends AnyRouter>(opts: WSSHandlerOptions<TRouter>): (client: ws.WebSocket, req: IncomingMessage) => void;
/**
 * Handle WebSocket keep-alive messages
 */
export declare function handleKeepAlive(client: ws.WebSocket, pingMs?: number, pongWaitMs?: number): void;
export declare function applyWSSHandler<TRouter extends AnyRouter>(opts: WSSHandlerOptions<TRouter>): {
    broadcastReconnectNotification: () => void;
};
//# sourceMappingURL=ws.d.ts.map