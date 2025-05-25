import type { ParserZodEsque } from '../parser';
type UtilityParser<TInput, TOutput> = ParserZodEsque<TInput, TOutput> & {
    parse: (input: unknown) => TOutput;
};
/**
 * File is only available from Node19+ but it always extends Blob so we can use that as a type until we eventually drop Node18
 */
interface FileLike extends Blob {
    readonly name: string;
}
type OctetInput = Blob | Uint8Array | FileLike;
export declare const octetInputParser: UtilityParser<OctetInput, ReadableStream>;
export {};
//# sourceMappingURL=contentTypeParsers.d.ts.map