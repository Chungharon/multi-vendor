import { StandardSchemaV1Error } from '../vendor/standard-schema-v1/error.mjs';

function getParseFn(procedureParser) {
    const parser = procedureParser;
    const isStandardSchema = '~standard' in parser;
    if (typeof parser === 'function' && typeof parser.assert === 'function') {
        // ParserArkTypeEsque - arktype schemas shouldn't be called as a function because they return a union type instead of throwing
        return parser.assert.bind(parser);
    }
    if (typeof parser === 'function' && !isStandardSchema) {
        // ParserValibotEsque (>= v0.31.0)
        // ParserCustomValidatorEsque - note the check for standard-schema conformance - some libraries like `effect` use function schemas which are *not* a "parse" function.
        return parser;
    }
    if (typeof parser.parseAsync === 'function') {
        // ParserZodEsque
        return parser.parseAsync.bind(parser);
    }
    if (typeof parser.parse === 'function') {
        // ParserZodEsque
        // ParserValibotEsque (< v0.13.0)
        return parser.parse.bind(parser);
    }
    if (typeof parser.validateSync === 'function') {
        // ParserYupEsque
        return parser.validateSync.bind(parser);
    }
    if (typeof parser.create === 'function') {
        // ParserSuperstructEsque
        return parser.create.bind(parser);
    }
    if (typeof parser.assert === 'function') {
        // ParserScaleEsque
        return (value)=>{
            parser.assert(value);
            return value;
        };
    }
    if (isStandardSchema) {
        // StandardSchemaEsque
        return async (value)=>{
            const result = await parser['~standard'].validate(value);
            if (result.issues) {
                throw new StandardSchemaV1Error(result.issues);
            }
            return result.value;
        };
    }
    throw new Error('Could not find a validator fn');
}

export { getParseFn };
