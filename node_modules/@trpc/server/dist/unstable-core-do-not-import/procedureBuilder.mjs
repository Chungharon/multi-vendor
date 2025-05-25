import { TRPCError, getTRPCErrorFromUnknown } from './error/TRPCError.mjs';
import { createOutputMiddleware, createInputMiddleware, middlewareMarker } from './middleware.mjs';
import { getParseFn } from './parser.mjs';
import { mergeWithoutOverrides } from './utils.mjs';

function createNewBuilder(def1, def2) {
    const { middlewares = [], inputs, meta, ...rest } = def2;
    // TODO: maybe have a fn here to warn about calls
    return createBuilder({
        ...mergeWithoutOverrides(def1, rest),
        inputs: [
            ...def1.inputs,
            ...inputs ?? []
        ],
        middlewares: [
            ...def1.middlewares,
            ...middlewares
        ],
        meta: def1.meta && meta ? {
            ...def1.meta,
            ...meta
        } : meta ?? def1.meta
    });
}
function createBuilder(initDef = {}) {
    const _def = {
        procedure: true,
        inputs: [],
        middlewares: [],
        ...initDef
    };
    const builder = {
        _def,
        input (input) {
            const parser = getParseFn(input);
            return createNewBuilder(_def, {
                inputs: [
                    input
                ],
                middlewares: [
                    createInputMiddleware(parser)
                ]
            });
        },
        output (output) {
            const parser = getParseFn(output);
            return createNewBuilder(_def, {
                output,
                middlewares: [
                    createOutputMiddleware(parser)
                ]
            });
        },
        meta (meta) {
            return createNewBuilder(_def, {
                meta
            });
        },
        use (middlewareBuilderOrFn) {
            // Distinguish between a middleware builder and a middleware function
            const middlewares = '_middlewares' in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
                middlewareBuilderOrFn
            ];
            return createNewBuilder(_def, {
                middlewares: middlewares
            });
        },
        unstable_concat (builder) {
            return createNewBuilder(_def, builder._def);
        },
        concat (builder) {
            return createNewBuilder(_def, builder._def);
        },
        query (resolver) {
            return createResolver({
                ..._def,
                type: 'query'
            }, resolver);
        },
        mutation (resolver) {
            return createResolver({
                ..._def,
                type: 'mutation'
            }, resolver);
        },
        subscription (resolver) {
            return createResolver({
                ..._def,
                type: 'subscription'
            }, resolver);
        },
        experimental_caller (caller) {
            return createNewBuilder(_def, {
                caller
            });
        }
    };
    return builder;
}
function createResolver(_defIn, resolver) {
    const finalBuilder = createNewBuilder(_defIn, {
        resolver,
        middlewares: [
            async function resolveMiddleware(opts) {
                const data = await resolver(opts);
                return {
                    marker: middlewareMarker,
                    ok: true,
                    data,
                    ctx: opts.ctx
                };
            }
        ]
    });
    const _def = {
        ...finalBuilder._def,
        type: _defIn.type,
        experimental_caller: Boolean(finalBuilder._def.caller),
        meta: finalBuilder._def.meta,
        $types: null
    };
    const invoke = createProcedureCaller(finalBuilder._def);
    const callerOverride = finalBuilder._def.caller;
    if (!callerOverride) {
        return invoke;
    }
    const callerWrapper = async (...args)=>{
        return await callerOverride({
            args,
            invoke,
            _def: _def
        });
    };
    callerWrapper._def = _def;
    return callerWrapper;
}
const codeblock = `
This is a client-only function.
If you want to call this function on the server, see https://trpc.io/docs/v11/server/server-side-calls
`.trim();
// run the middlewares recursively with the resolver as the last one
async function callRecursive(index, _def, opts) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const middleware = _def.middlewares[index];
        const result = await middleware({
            ...opts,
            meta: _def.meta,
            input: opts.input,
            next (_nextOpts) {
                const nextOpts = _nextOpts;
                return callRecursive(index + 1, _def, {
                    ...opts,
                    ctx: nextOpts?.ctx ? {
                        ...opts.ctx,
                        ...nextOpts.ctx
                    } : opts.ctx,
                    input: nextOpts && 'input' in nextOpts ? nextOpts.input : opts.input,
                    getRawInput: nextOpts?.getRawInput ?? opts.getRawInput
                });
            }
        });
        return result;
    } catch (cause) {
        return {
            ok: false,
            error: getTRPCErrorFromUnknown(cause),
            marker: middlewareMarker
        };
    }
}
function createProcedureCaller(_def) {
    async function procedure(opts) {
        // is direct server-side call
        if (!opts || !('getRawInput' in opts)) {
            throw new Error(codeblock);
        }
        // there's always at least one "next" since we wrap this.resolver in a middleware
        const result = await callRecursive(0, _def, opts);
        if (!result) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'No result from middlewares - did you forget to `return next()`?'
            });
        }
        if (!result.ok) {
            // re-throw original error
            throw result.error;
        }
        return result.data;
    }
    procedure._def = _def;
    procedure.procedure = true;
    // FIXME typecast shouldn't be needed - fixittt
    return procedure;
}

export { createBuilder };
