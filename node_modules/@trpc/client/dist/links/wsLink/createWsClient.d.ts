import type { WebSocketClientOptions } from './wsClient/options';
import { WsClient } from './wsClient/wsClient';
export declare function createWSClient(opts: WebSocketClientOptions): WsClient;
export type TRPCWebSocketClient = ReturnType<typeof createWSClient>;
export { WebSocketClientOptions };
//# sourceMappingURL=createWsClient.d.ts.map