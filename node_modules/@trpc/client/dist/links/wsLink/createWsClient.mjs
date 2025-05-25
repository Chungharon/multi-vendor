import { WsClient } from './wsClient/wsClient.mjs';

function createWSClient(opts) {
    return new WsClient(opts);
}

export { createWSClient };
