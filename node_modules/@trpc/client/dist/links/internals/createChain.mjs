import { observable } from '@trpc/server/observable';

/** @internal */ function createChain(opts) {
    return observable((observer)=>{
        function execute(index = 0, op = opts.op) {
            const next = opts.links[index];
            if (!next) {
                throw new Error('No more links to execute - did you forget to add an ending link?');
            }
            const subscription = next({
                op,
                next (nextOp) {
                    const nextObserver = execute(index + 1, nextOp);
                    return nextObserver;
                }
            });
            return subscription;
        }
        const obs$ = execute();
        return obs$.subscribe(observer);
    });
}

export { createChain };
