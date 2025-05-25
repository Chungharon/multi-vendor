const isFunction = (fn)=>typeof fn === 'function';
function getFetch(customFetchImpl) {
    if (customFetchImpl) {
        return customFetchImpl;
    }
    if (typeof window !== 'undefined' && isFunction(window.fetch)) {
        return window.fetch;
    }
    if (typeof globalThis !== 'undefined' && isFunction(globalThis.fetch)) {
        return globalThis.fetch;
    }
    throw new Error('No fetch implementation found');
}

export { getFetch };
