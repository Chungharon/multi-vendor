import { TRPCUntypedClient } from './internals/TRPCUntypedClient.mjs';

function createTRPCUntypedClient(opts) {
    return new TRPCUntypedClient(opts);
}

export { TRPCUntypedClient, createTRPCUntypedClient };
