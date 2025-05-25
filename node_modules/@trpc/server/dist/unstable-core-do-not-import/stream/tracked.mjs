const trackedSymbol = Symbol();
/**
 * Produce a typed server-sent event message
 * @deprecated use `tracked(id, data)` instead
 */ function sse(event) {
    return tracked(event.id, event.data);
}
function isTrackedEnvelope(value) {
    return Array.isArray(value) && value[2] === trackedSymbol;
}
/**
 * Automatically track an event so that it can be resumed from a given id if the connection is lost
 */ function tracked(id, data) {
    if (id === '') {
        // This limitation could be removed by using different SSE event names / channels for tracked event and non-tracked event
        throw new Error('`id` must not be an empty string as empty string is the same as not setting the id at all');
    }
    return [
        id,
        data,
        trackedSymbol
    ];
}

export { isTrackedEnvelope, sse, tracked };
