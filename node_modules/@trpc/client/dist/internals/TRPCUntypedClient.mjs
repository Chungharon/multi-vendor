import { share, observableToPromise } from '@trpc/server/observable';
import { createChain } from '../links/internals/createChain.mjs';
import { TRPCClientError } from '../TRPCClientError.mjs';

function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class TRPCUntypedClient {
    $request(opts) {
        const chain$ = createChain({
            links: this.links,
            op: {
                ...opts,
                context: opts.context ?? {},
                id: ++this.requestId
            }
        });
        return chain$.pipe(share());
    }
    async requestAsPromise(opts) {
        try {
            const req$ = this.$request(opts);
            const envelope = await observableToPromise(req$);
            const data = envelope.result.data;
            return data;
        } catch (err) {
            throw TRPCClientError.from(err);
        }
    }
    query(path, input, opts) {
        return this.requestAsPromise({
            type: 'query',
            path,
            input,
            context: opts?.context,
            signal: opts?.signal
        });
    }
    mutation(path, input, opts) {
        return this.requestAsPromise({
            type: 'mutation',
            path,
            input,
            context: opts?.context,
            signal: opts?.signal
        });
    }
    subscription(path, input, opts) {
        const observable$ = this.$request({
            type: 'subscription',
            path,
            input,
            context: opts.context,
            signal: opts.signal
        });
        return observable$.subscribe({
            next (envelope) {
                switch(envelope.result.type){
                    case 'state':
                        {
                            opts.onConnectionStateChange?.(envelope.result);
                            break;
                        }
                    case 'started':
                        {
                            opts.onStarted?.({
                                context: envelope.context
                            });
                            break;
                        }
                    case 'stopped':
                        {
                            opts.onStopped?.();
                            break;
                        }
                    case 'data':
                    case undefined:
                        {
                            opts.onData?.(envelope.result.data);
                            break;
                        }
                }
            },
            error (err) {
                opts.onError?.(err);
            },
            complete () {
                opts.onComplete?.();
            }
        });
    }
    constructor(opts){
        _define_property(this, "links", void 0);
        _define_property(this, "runtime", void 0);
        _define_property(this, "requestId", void 0);
        this.requestId = 0;
        this.runtime = {};
        // Initialize the links
        this.links = opts.links.map((link)=>link(this.runtime));
    }
}

export { TRPCUntypedClient };
