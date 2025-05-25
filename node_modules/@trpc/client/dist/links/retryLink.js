'use strict';

var observable = require('@trpc/server/observable');
var inputWithTrackedEventId = require('../internals/inputWithTrackedEventId.js');

/* istanbul ignore file -- @preserve */ // We're not actually exporting this link
/**
 * @see https://trpc.io/docs/v11/client/links/retryLink
 */ function retryLink(opts) {
    // initialized config
    return ()=>{
        // initialized in app
        return (callOpts)=>{
            // initialized for request
            return observable.observable((observer)=>{
                let next$;
                let callNextTimeout = undefined;
                let lastEventId = undefined;
                attempt(1);
                function opWithLastEventId() {
                    const op = callOpts.op;
                    if (!lastEventId) {
                        return op;
                    }
                    return {
                        ...op,
                        input: inputWithTrackedEventId.inputWithTrackedEventId(op.input, lastEventId)
                    };
                }
                function attempt(attempts) {
                    const op = opWithLastEventId();
                    next$ = callOpts.next(op).subscribe({
                        error (error) {
                            const shouldRetry = opts.retry({
                                op,
                                attempts,
                                error
                            });
                            if (!shouldRetry) {
                                observer.error(error);
                                return;
                            }
                            const delayMs = opts.retryDelayMs?.(attempts) ?? 0;
                            if (delayMs <= 0) {
                                attempt(attempts + 1);
                                return;
                            }
                            callNextTimeout = setTimeout(()=>attempt(attempts + 1), delayMs);
                        },
                        next (envelope) {
                            //
                            if ((!envelope.result.type || envelope.result.type === 'data') && envelope.result.id) {
                                //
                                lastEventId = envelope.result.id;
                            }
                            observer.next(envelope);
                        },
                        complete () {
                            observer.complete();
                        }
                    });
                }
                return ()=>{
                    next$.unsubscribe();
                    clearTimeout(callNextTimeout);
                };
            });
        };
    };
}

exports.retryLink = retryLink;
