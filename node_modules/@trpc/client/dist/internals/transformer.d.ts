import type { AnyClientTypes, CombinedDataTransformer, DataTransformerOptions, TypeError } from '@trpc/server/unstable-core-do-not-import';
/**
 * @internal
 */
export type CoercedTransformerParameters = {
    transformer?: DataTransformerOptions;
};
type TransformerOptionYes = {
    /**
     * Data transformer
     *
     * You must use the same transformer on the backend and frontend
     * @see https://trpc.io/docs/v11/data-transformers
     **/
    transformer: DataTransformerOptions;
};
type TransformerOptionNo = {
    /**
     * Data transformer
     *
     * You must use the same transformer on the backend and frontend
     * @see https://trpc.io/docs/v11/data-transformers
     **/
    transformer?: TypeError<'You must define a transformer on your your `initTRPC`-object first'>;
};
/**
 * @internal
 */
export type TransformerOptions<TRoot extends Pick<AnyClientTypes, 'transformer'>> = TRoot['transformer'] extends true ? TransformerOptionYes : TransformerOptionNo;
/**
 * @internal
 */
/**
 * @internal
 */
export declare function getTransformer(transformer: TransformerOptions<{
    transformer: false;
}>['transformer'] | TransformerOptions<{
    transformer: true;
}>['transformer'] | undefined): CombinedDataTransformer;
export {};
//# sourceMappingURL=transformer.d.ts.map