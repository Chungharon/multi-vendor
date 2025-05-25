import type { Maybe } from '@trpc/server/unstable-core-do-not-import';
/**
 * Like `Promise.all()` but for abort signals
 * - When all signals have been aborted, the merged signal will be aborted
 * - If one signal is `null`, no signal will be aborted
 */
export declare function allAbortSignals(...signals: Maybe<AbortSignal>[]): AbortSignal;
/**
 * Like `Promise.race` but for abort signals
 *
 * Basically, a ponyfill for
 * [`AbortSignal.any`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static).
 */
export declare function raceAbortSignals(...signals: Maybe<AbortSignal>[]): AbortSignal;
//# sourceMappingURL=signals.d.ts.map