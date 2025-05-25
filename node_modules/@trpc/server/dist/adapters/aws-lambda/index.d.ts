/**
 * If you're making an adapter for tRPC and looking at this file for reference, you should import types and functions from `@trpc/server` and `@trpc/server/http`
 *
 * @example
 * ```ts
 * import type { AnyTRPCRouter } from '@trpc/server'
 * import type { HTTPBaseHandlerOptions } from '@trpc/server/http'
 * ```
 */
import type { Context as APIGWContext } from 'aws-lambda';
import type { AnyRouter, CreateContextCallback, inferRouterContext } from '../../@trpc/server';
import type { HTTPBaseHandlerOptions, TRPCRequestInfo } from '../../@trpc/server/http';
import type { inferAPIGWReturn, LambdaEvent } from './getPlanner';
export type CreateAWSLambdaContextOptions<TEvent extends LambdaEvent> = {
    event: TEvent;
    context: APIGWContext;
    info: TRPCRequestInfo;
};
export type AWSLambdaOptions<TRouter extends AnyRouter, TEvent extends LambdaEvent> = HTTPBaseHandlerOptions<TRouter, TEvent> & CreateContextCallback<inferRouterContext<AnyRouter>, AWSLambdaCreateContextFn<TRouter, TEvent>>;
export type AWSLambdaCreateContextFn<TRouter extends AnyRouter, TEvent extends LambdaEvent> = ({ event, context, info, }: CreateAWSLambdaContextOptions<TEvent>) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;
export declare function awsLambdaRequestHandler<TRouter extends AnyRouter, TEvent extends LambdaEvent>(opts: AWSLambdaOptions<TRouter, TEvent>): (event: TEvent, context: APIGWContext) => Promise<inferAPIGWReturn<TEvent>>;
//# sourceMappingURL=index.d.ts.map