'use strict';

var codes = require('./unstable-core-do-not-import/rpc/codes.js');
var parseTRPCMessage = require('./unstable-core-do-not-import/rpc/parseTRPCMessage.js');
require('./vendor/unpromise/unpromise.js');
require('./unstable-core-do-not-import/stream/utils/disposable.js');
require('./unstable-core-do-not-import/rootConfig.js');



exports.TRPC_ERROR_CODES_BY_KEY = codes.TRPC_ERROR_CODES_BY_KEY;
exports.TRPC_ERROR_CODES_BY_NUMBER = codes.TRPC_ERROR_CODES_BY_NUMBER;
exports.parseTRPCMessage = parseTRPCMessage.parseTRPCMessage;
