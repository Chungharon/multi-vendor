interface ProxyCallbackOptions {
    path: readonly string[];
    args: readonly unknown[];
}
type ProxyCallback = (opts: ProxyCallbackOptions) => unknown;
/**
 * Creates a proxy that calls the callback with the path and arguments
 *
 * @internal
 */
export declare const createRecursiveProxy: <TFaux = unknown>(callback: ProxyCallback) => TFaux;
/**
 * Used in place of `new Proxy` where each handler will map 1 level deep to another value.
 *
 * @internal
 */
export declare const createFlatProxy: <TFaux>(callback: (path: keyof TFaux) => any) => TFaux;
export {};
//# sourceMappingURL=createProxy.d.ts.map