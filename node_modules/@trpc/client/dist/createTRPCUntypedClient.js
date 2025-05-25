'use strict';

var TRPCUntypedClient = require('./internals/TRPCUntypedClient.js');

function createTRPCUntypedClient(opts) {
    return new TRPCUntypedClient.TRPCUntypedClient(opts);
}

exports.TRPCUntypedClient = TRPCUntypedClient.TRPCUntypedClient;
exports.createTRPCUntypedClient = createTRPCUntypedClient;
