'use strict';

var observable = require('@trpc/server/observable');
var transformer = require('../../internals/transformer.js');
var createWsClient = require('./createWsClient.js');

function wsLink(opts) {
    const { client } = opts;
    const transformer$1 = transformer.getTransformer(opts.transformer);
    return ()=>{
        return ({ op })=>{
            return observable.observable((observer)=>{
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
                    transformer: transformer$1
                }).subscribe(observer);
                return ()=>{
                    requestSubscription.unsubscribe();
                    connStateSubscription?.unsubscribe();
                };
            });
        };
    };
}

exports.createWSClient = createWsClient.createWSClient;
exports.wsLink = wsLink;
