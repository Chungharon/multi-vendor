import type { AnyRouter, inferClientTypes } from '@trpc/server/unstable-core-do-not-import';
import type { TransformerOptions } from '../../unstable-internals';
import type { TRPCLink } from '../types';
import type { TRPCWebSocketClient, WebSocketClientOptions } from './createWsClient';
import { createWSClient } from './createWsClient';
export type WebSocketLinkOptions<TRouter extends AnyRouter> = {
    client: TRPCWebSocketClient;
} & TransformerOptions<inferClientTypes<TRouter>>;
export declare function wsLink<TRouter extends AnyRouter>(opts: WebSocketLinkOptions<TRouter>): TRPCLink<TRouter>;
export { TRPCWebSocketClient, WebSocketClientOptions, createWSClient };
//# sourceMappingURL=wsLink.d.ts.map