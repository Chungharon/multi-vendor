'use strict';

var createProxy = require('./unstable-core-do-not-import/createProxy.js');
var getErrorShape = require('./unstable-core-do-not-import/error/getErrorShape.js');
require('./vendor/unpromise/unpromise.js');
require('./unstable-core-do-not-import/stream/utils/disposable.js');
require('./unstable-core-do-not-import/rootConfig.js');



exports.createFlatProxy = createProxy.createFlatProxy;
exports.getErrorShape = getErrorShape.getErrorShape;
