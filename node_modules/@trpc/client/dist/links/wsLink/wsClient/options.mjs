const lazyDefaults = {
    enabled: false,
    closeMs: 0
};
const keepAliveDefaults = {
    enabled: false,
    pongTimeoutMs: 1000,
    intervalMs: 5000
};
/**
 * Calculates a delay for exponential backoff based on the retry attempt index.
 * The delay starts at 0 for the first attempt and doubles for each subsequent attempt,
 * capped at 30 seconds.
 */ const exponentialBackoff = (attemptIndex)=>{
    return attemptIndex === 0 ? 0 : Math.min(1000 * 2 ** attemptIndex, 30000);
};

export { exponentialBackoff, keepAliveDefaults, lazyDefaults };
