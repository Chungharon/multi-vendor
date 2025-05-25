'use strict';

var createProxy = require('./unstable-core-do-not-import/createProxy.js');
var getErrorShape = require('./unstable-core-do-not-import/error/getErrorShape.js');
var TRPCError = require('./unstable-core-do-not-import/error/TRPCError.js');
var router = require('./unstable-core-do-not-import/router.js');
require('./vendor/unpromise/unpromise.js');
require('./unstable-core-do-not-import/stream/utils/disposable.js');
var tracked = require('./unstable-core-do-not-import/stream/tracked.js');
var transformer = require('./unstable-core-do-not-import/transformer.js');
var initTRPC = require('./unstable-core-do-not-import/initTRPC.js');
var middleware = require('./unstable-core-do-not-import/middleware.js');
var error = require('./vendor/standard-schema-v1/error.js');
require('./unstable-core-do-not-import/rootConfig.js');



exports.createTRPCFlatProxy = createProxy.createFlatProxy;
exports.createTRPCRecursiveProxy = createProxy.createRecursiveProxy;
exports.getErrorShape = getErrorShape.getErrorShape;
exports.TRPCError = TRPCError.TRPCError;
exports.getTRPCErrorFromUnknown = TRPCError.getTRPCErrorFromUnknown;
exports.callTRPCProcedure = router.callProcedure;
exports.experimental_lazy = router.lazy;
exports.lazy = router.lazy;
exports.isTrackedEnvelope = tracked.isTrackedEnvelope;
exports.sse = tracked.sse;
exports.tracked = tracked.tracked;
exports.transformTRPCResponse = transformer.transformTRPCResponse;
exports.initTRPC = initTRPC.initTRPC;
exports.experimental_standaloneMiddleware = middleware.experimental_standaloneMiddleware;
exports.experimental_trpcMiddleware = middleware.experimental_standaloneMiddleware;
exports.StandardSchemaV1Error = error.StandardSchemaV1Error;
