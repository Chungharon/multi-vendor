import type { Observable, Observer, TeardownLogic } from './types';
/** @public */
export type inferObservableValue<TObservable> = TObservable extends Observable<infer TValue, unknown> ? TValue : never;
/** @public */
export declare function isObservable(x: unknown): x is Observable<unknown, unknown>;
/** @public */
export declare function observable<TValue, TError = unknown>(subscribe: (observer: Observer<TValue, TError>) => TeardownLogic): Observable<TValue, TError>;
/** @internal */
export declare function observableToPromise<TValue>(observable: Observable<TValue, unknown>): Promise<TValue>;
/** @internal */
export declare function observableToAsyncIterable<TValue>(observable: Observable<TValue, unknown>, signal: AbortSignal): AsyncIterable<TValue>;
//# sourceMappingURL=observable.d.ts.map