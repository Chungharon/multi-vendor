import type { MonoTypeOperatorFunction, Observer, OperatorFunction } from './types';
export declare function map<TValueBefore, TError, TValueAfter>(project: (value: TValueBefore, index: number) => TValueAfter): OperatorFunction<TValueBefore, TError, TValueAfter, TError>;
interface ShareConfig {
}
export declare function share<TValue, TError>(_opts?: ShareConfig): MonoTypeOperatorFunction<TValue, TError>;
export declare function tap<TValue, TError>(observer: Partial<Observer<TValue, TError>>): MonoTypeOperatorFunction<TValue, TError>;
export declare function distinctUntilChanged<TValue, TError>(compare?: (a: TValue, b: TValue) => boolean): MonoTypeOperatorFunction<TValue, TError>;
export declare function distinctUntilDeepChanged<TValue, TError>(): MonoTypeOperatorFunction<TValue, TError>;
export {};
//# sourceMappingURL=operators.d.ts.map