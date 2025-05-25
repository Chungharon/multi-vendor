'use strict';

var resolveResponse = require('../../unstable-core-do-not-import/http/resolveResponse.js');
require('../../unstable-core-do-not-import/rootConfig.js');
require('../../vendor/unpromise/unpromise.js');
require('../../unstable-core-do-not-import/stream/utils/disposable.js');
var getPlanner = require('./getPlanner.js');

function awsLambdaRequestHandler(opts) {
    return async (event, context)=>{
        const planner = getPlanner.getPlanner(event);
        const createContext = async (innerOpts)=>{
            return await opts.createContext?.({
                event,
                context,
                ...innerOpts
            });
        };
        const response = await resolveResponse.resolveResponse({
            ...opts,
            createContext,
            req: planner.request,
            path: planner.path,
            error: null,
            onError (o) {
                opts?.onError?.({
                    ...o,
                    req: event
                });
            }
        });
        return await planner.toResult(response);
    };
}

exports.awsLambdaRequestHandler = awsLambdaRequestHandler;
