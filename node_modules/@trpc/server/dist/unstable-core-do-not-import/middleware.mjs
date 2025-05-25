import { TRPCError } from './error/TRPCError.mjs';
import { isObject } from './utils.mjs';

/** @internal */ const middlewareMarker = 'middlewareMarker';
/**
 * @internal
 */ function createMiddlewareFactory() {
    function createMiddlewareInner(middlewares) {
        return {
            _middlewares: middlewares,
            unstable_pipe (middlewareBuilderOrFn) {
                const pipedMiddleware = '_middlewares' in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
                    middlewareBuilderOrFn
                ];
                return createMiddlewareInner([
                    ...middlewares,
                    ...pipedMiddleware
                ]);
            }
        };
    }
    function createMiddleware(fn) {
        return createMiddlewareInner([
            fn
        ]);
    }
    return createMiddleware;
}
/**
 * Create a standalone middleware
 * @see https://trpc.io/docs/v11/server/middlewares#experimental-standalone-middlewares
 * @deprecated use `.concat()` instead
 */ const experimental_standaloneMiddleware = ()=>({
        create: createMiddlewareFactory()
    });
/**
 * @internal
 * Please note, `trpc-openapi` uses this function.
 */ function createInputMiddleware(parse) {
    const inputMiddleware = async function inputValidatorMiddleware(opts) {
        let parsedInput;
        const rawInput = await opts.getRawInput();
        try {
            parsedInput = await parse(rawInput);
        } catch (cause) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                cause
            });
        }
        // Multiple input parsers
        const combinedInput = isObject(opts.input) && isObject(parsedInput) ? {
            ...opts.input,
            ...parsedInput
        } : parsedInput;
        return opts.next({
            input: combinedInput
        });
    };
    inputMiddleware._type = 'input';
    return inputMiddleware;
}
/**
 * @internal
 */ function createOutputMiddleware(parse) {
    const outputMiddleware = async function outputValidatorMiddleware({ next }) {
        const result = await next();
        if (!result.ok) {
            // pass through failures without validating
            return result;
        }
        try {
            const data = await parse(result.data);
            return {
                ...result,
                data
            };
        } catch (cause) {
            throw new TRPCError({
                message: 'Output validation failed',
                code: 'INTERNAL_SERVER_ERROR',
                cause
            });
        }
    };
    outputMiddleware._type = 'output';
    return outputMiddleware;
}

export { createInputMiddleware, createMiddlewareFactory, createOutputMiddleware, experimental_standaloneMiddleware, middlewareMarker };
