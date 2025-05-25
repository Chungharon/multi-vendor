import type { Observable } from './types';
export interface BehaviorSubject<TValue> extends Observable<TValue, never> {
    observable: Observable<TValue, never>;
    next: (value: TValue) => void;
    get: () => TValue;
}
export interface ReadonlyBehaviorSubject<TValue> extends Omit<BehaviorSubject<TValue>, 'next'> {
}
/**
 * @internal
 * An observable that maintains and provides a "current value" to subscribers
 * @see https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject
 */
export declare function behaviorSubject<TValue>(initialValue: TValue): BehaviorSubject<TValue>;
//# sourceMappingURL=behaviorSubject.d.ts.map