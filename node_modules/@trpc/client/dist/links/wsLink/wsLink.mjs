import { observable } from '@trpc/server/observable';
import { getTransformer } from '../../internals/transformer.mjs';
export { createWSClient } from './createWsClient.mjs';

function wsLink(opts) {
    const { client } = opts;
    const transformer = getTransformer(opts.transformer);
    return ()=>{
        return ({ op })=>{
            return observable((observer)=>{
                const connStateSubscription = op.type === 'subscription' ? client.connectionState.subscribe({
                    next (result) {
                        observer.next({
                            result,
                            context: op.context
                        });
                    }
                }) : null;
                const requestSubscription = client.request({
                    op,
                    transformer
                }).subscribe(observer);
                return ()=>{
                    requestSubscription.unsubscribe();
                    connStateSubscription?.unsubscribe();
                };
            });
        };
    };
}

export { wsLink };
