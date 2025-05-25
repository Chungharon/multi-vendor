/** @internal */
export declare const unsetMarker: unique symbol;
export type UnsetMarker = typeof unsetMarker;
/**
 * Ensures there are no duplicate keys when building a procedure.
 * @internal
 */
export declare function mergeWithoutOverrides<TType extends Record<string, unknown>>(obj1: TType, ...objs: Partial<TType>[]): TType;
/**
 * Check that value is object
 * @internal
 */
export declare function isObject(value: unknown): value is Record<string, unknown>;
type AnyFn = ((...args: any[]) => unknown) & Record<keyof any, unknown>;
export declare function isFunction(fn: unknown): fn is AnyFn;
/**
 * Create an object without inheriting anything from `Object.prototype`
 * @internal
 */
export declare function omitPrototype<TObj extends Record<string, unknown>>(obj: TObj): TObj;
export declare function isAsyncIterable<TValue>(value: unknown): value is AsyncIterable<TValue>;
/**
 * Run an IIFE
 */
export declare const run: <TValue>(fn: () => TValue) => TValue;
export declare function noop(): void;
export declare function identity<T>(it: T): T;
/**
 * Generic runtime assertion function. Throws, if the condition is not `true`.
 *
 * Can be used as a slightly less dangerous variant of type assertions. Code
 * mistakes would be revealed at runtime then (hopefully during testing).
 */
export declare function assert(condition: boolean, msg?: string): asserts condition;
export declare function sleep(ms?: number): Promise<void>;
/**
 * Ponyfill for
 * [`AbortSignal.any`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static).
 */
export declare function abortSignalsAnyPonyfill(signals: AbortSignal[]): AbortSignal;
export {};
//# sourceMappingURL=utils.d.ts.map