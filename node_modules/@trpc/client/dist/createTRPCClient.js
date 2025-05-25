'use strict';

var unstableCoreDoNotImport = require('@trpc/server/unstable-core-do-not-import');
var TRPCUntypedClient = require('./internals/TRPCUntypedClient.js');

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
    const proxy = unstableCoreDoNotImport.createRecursiveProxy(({ path, args })=>{
        const pathCopy = [
            ...path
        ];
        const procedureType = clientCallTypeToProcedureType(pathCopy.pop());
        const fullPath = pathCopy.join('.');
        return client[procedureType](fullPath, ...args);
    });
    return unstableCoreDoNotImport.createFlatProxy((key)=>{
        if (key === untypedClientSymbol) {
            return client;
        }
        return proxy[key];
    });
}
function createTRPCClient(opts) {
    const client = new TRPCUntypedClient.TRPCUntypedClient(opts);
    const proxy = createTRPCClientProxy(client);
    return proxy;
}
/**
 * Get an untyped client from a proxy client
 * @internal
 */ function getUntypedClient(client) {
    return client[untypedClientSymbol];
}

exports.clientCallTypeToProcedureType = clientCallTypeToProcedureType;
exports.createTRPCClient = createTRPCClient;
exports.createTRPCClientProxy = createTRPCClientProxy;
exports.getUntypedClient = getUntypedClient;
