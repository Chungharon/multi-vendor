/**
 * The default check to see if we're in a server
 */ const isServerDefault = typeof window === 'undefined' || 'Deno' in window || // eslint-disable-next-line @typescript-eslint/dot-notation
globalThis.process?.env?.['NODE_ENV'] === 'test' || !!globalThis.process?.env?.['JEST_WORKER_ID'] || !!globalThis.process?.env?.['VITEST_WORKER_ID'];

export { isServerDefault };
