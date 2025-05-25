'use strict';

var wsClient = require('./wsClient/wsClient.js');

function createWSClient(opts) {
    return new wsClient.WsClient(opts);
}

exports.createWSClient = createWSClient;
