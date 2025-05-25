'use strict';

/* eslint-disable @typescript-eslint/no-non-null-assertion */ /**
 * A function that should never be called unless we messed something up.
 */ const throwFatalError = ()=>{
    throw new Error('Something went wrong. Please submit an issue at https://github.com/trpc/trpc/issues/new');
};
/**
 * Dataloader that's very inspired by https://github.com/graphql/dataloader
 * Less configuration, no caching, and allows you to cancel requests
 * When cancelling a single fetch the whole batch will be cancelled only when _all_ items are cancelled
 */ function dataLoader(batchLoader) {
    let pendingItems = null;
    let dispatchTimer = null;
    const destroyTimerAndPendingItems = ()=>{
        clearTimeout(dispatchTimer);
        dispatchTimer = null;
        pendingItems = null;
    };
    /**
   * Iterate through the items and split them into groups based on the `batchLoader`'s validate function
   */ function groupItems(items) {
        const groupedItems = [
            []
        ];
        let index = 0;
        while(true){
            const item = items[index];
            if (!item) {
                break;
            }
            const lastGroup = groupedItems[groupedItems.length - 1];
            if (item.aborted) {
                // Item was aborted before it was dispatched
                item.reject?.(new Error('Aborted'));
                index++;
                continue;
            }
            const isValid = batchLoader.validate(lastGroup.concat(item).map((it)=>it.key));
            if (isValid) {
                lastGroup.push(item);
                index++;
                continue;
            }
            if (lastGroup.length === 0) {
                item.reject?.(new Error('Input is too big for a single dispatch'));
                index++;
                continue;
            }
            // Create new group, next iteration will try to add the item to that
            groupedItems.push([]);
        }
        return groupedItems;
    }
    function dispatch() {
        const groupedItems = groupItems(pendingItems);
        destroyTimerAndPendingItems();
        // Create batches for each group of items
        for (const items of groupedItems){
            if (!items.length) {
                continue;
            }
            const batch = {
                items
            };
            for (const item of items){
                item.batch = batch;
            }
            const promise = batchLoader.fetch(batch.items.map((_item)=>_item.key));
            promise.then(async (result)=>{
                await Promise.all(result.map(async (valueOrPromise, index)=>{
                    const item = batch.items[index];
                    try {
                        const value = await Promise.resolve(valueOrPromise);
                        item.resolve?.(value);
                    } catch (cause) {
                        item.reject?.(cause);
                    }
                    item.batch = null;
                    item.reject = null;
                    item.resolve = null;
                }));
                for (const item of batch.items){
                    item.reject?.(new Error('Missing result'));
                    item.batch = null;
                }
            }).catch((cause)=>{
                for (const item of batch.items){
                    item.reject?.(cause);
                    item.batch = null;
                }
            });
        }
    }
    function load(key) {
        const item = {
            aborted: false,
            key,
            batch: null,
            resolve: throwFatalError,
            reject: throwFatalError
        };
        const promise = new Promise((resolve, reject)=>{
            item.reject = reject;
            item.resolve = resolve;
            if (!pendingItems) {
                pendingItems = [];
            }
            pendingItems.push(item);
        });
        if (!dispatchTimer) {
            dispatchTimer = setTimeout(dispatch);
        }
        return promise;
    }
    return {
        load
    };
}

exports.dataLoader = dataLoader;
