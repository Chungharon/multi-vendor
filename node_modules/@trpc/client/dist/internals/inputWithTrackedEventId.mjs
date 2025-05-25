function inputWithTrackedEventId(input, lastEventId) {
    if (!lastEventId) {
        return input;
    }
    if (input != null && typeof input !== 'object') {
        return input;
    }
    return {
        ...input ?? {},
        lastEventId
    };
}

export { inputWithTrackedEventId };
