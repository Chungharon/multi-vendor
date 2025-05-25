'use strict';

var TRPCError = require('../../unstable-core-do-not-import/error/TRPCError.js');
require('../../vendor/unpromise/unpromise.js');
require('../../unstable-core-do-not-import/stream/utils/disposable.js');
require('../../unstable-core-do-not-import/rootConfig.js');

/**
 * Like `next/navigation`'s `notFound()` but throws a `TRPCError` that later will be handled by Next.js
 * @public
 */ const notFound = ()=>{
    throw new TRPCError.TRPCError({
        code: 'NOT_FOUND'
    });
};

exports.notFound = notFound;
