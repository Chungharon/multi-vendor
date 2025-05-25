import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
export type LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2;
export type APIGatewayResult = APIGatewayProxyResult | APIGatewayProxyStructuredResultV2;
/** 1:1 mapping of v1 or v2 input events, deduces which is which.
 * @internal
 **/
export type inferAPIGWReturn<TEvent> = TEvent extends APIGatewayProxyEvent ? APIGatewayProxyResult : TEvent extends APIGatewayProxyEventV2 ? APIGatewayProxyStructuredResultV2 : never;
export declare function getPlanner<TEvent extends LambdaEvent>(event: TEvent): {
    path: string;
    request: Request;
    toResult: (response: Response) => Promise<inferAPIGWReturn<TEvent>>;
};
//# sourceMappingURL=getPlanner.d.ts.map