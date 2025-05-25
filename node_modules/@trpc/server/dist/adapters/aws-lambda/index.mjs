import { resolveResponse } from '../../unstable-core-do-not-import/http/resolveResponse.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import { getPlanner } from './getPlanner.mjs';

function awsLambdaRequestHandler(opts) {
    return async (event, context)=>{
        const planner = getPlanner(event);
        const createContext = async (innerOpts)=>{
            return await opts.createContext?.({
                event,
                context,
                ...innerOpts
            });
        };
        const response = await resolveResponse({
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

export { awsLambdaRequestHandler };
