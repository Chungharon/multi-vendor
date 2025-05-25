import type { AnyClientTypes, EventSourceLike, inferClientTypes, InferrableClientTypes } from '@trpc/server/unstable-core-do-not-import';
import { type TransformerOptions } from '../unstable-internals';
import { type UrlOptionsWithConnectionParams } from './internals/urlWithConnectionParams';
import type { Operation, TRPCLink } from './types';
type HTTPSubscriptionLinkOptions<TRoot extends AnyClientTypes, TEventSource extends EventSourceLike.AnyConstructor = typeof EventSource> = {
    /**
     * EventSource ponyfill
     */
    EventSource?: TEventSource;
    /**
     * EventSource options or a callback that returns them
     */
    eventSourceOptions?: EventSourceLike.InitDictOf<TEventSource> | ((opts: {
        op: Operation;
    }) => EventSourceLike.InitDictOf<TEventSource> | Promise<EventSourceLike.InitDictOf<TEventSource>>);
} & TransformerOptions<TRoot> & UrlOptionsWithConnectionParams;
/**
 * @see https://trpc.io/docs/client/links/httpSubscriptionLink
 */
export declare function httpSubscriptionLink<TInferrable extends InferrableClientTypes, TEventSource extends EventSourceLike.AnyConstructor>(opts: HTTPSubscriptionLinkOptions<inferClientTypes<TInferrable>, TEventSource>): TRPCLink<TInferrable>;
/**
 * @deprecated use {@link httpSubscriptionLink} instead
 */
export declare const unstable_httpSubscriptionLink: typeof httpSubscriptionLink;
export {};
//# sourceMappingURL=httpSubscriptionLink.d.ts.map