import { createRecursiveProxy, createFlatProxy } from '@trpc/server/unstable-core-do-not-import';
import { TRPCUntypedClient } from './internals/TRPCUntypedClient.mjs';

const untypedClientSymbol = Symbol.for('trpc_untypedClient');
const clientCallTypeMap = {
    query: 'query',
    mutate: 'mutation',
    subscribe: 'subscription'
};
/** @internal */ const clientCallTypeToProcedureType = (clientCallType)=>{
    return clientCallTypeMap[clientCallType];
};
/**
 * @internal
 */ function createTRPCClientProxy(client) {
    const proxy = createRecursiveProxy(({ path, args })=>{
        const pathCopy = [
            ...path
        ];
        const procedureType = clientCallTypeToProcedureType(pathCopy.pop());
        const fullPath = pathCopy.join('.');
        return client[procedureType](fullPath, ...args);
    });
    return createFlatProxy((key)=>{
        if (key === untypedClientSymbol) {
            return client;
        }
        return proxy[key];
    });
}
function createTRPCClient(opts) {
    const client = new TRPCUntypedClient(opts);
    const proxy = createTRPCClientProxy(client);
    return proxy;
}
/**
 * Get an untyped client from a proxy client
 * @internal
 */ function getUntypedClient(client) {
    return client[untypedClientSymbol];
}

export { clientCallTypeToProcedureType, createTRPCClient, createTRPCClientProxy, getUntypedClient };
