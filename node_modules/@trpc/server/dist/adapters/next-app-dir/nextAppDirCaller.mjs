import { TRPCError, getTRPCErrorFromUnknown } from '../../unstable-core-do-not-import/error/TRPCError.mjs';
import { formDataToObject } from '../../unstable-core-do-not-import/http/formDataToObject.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';
import { TRPCRedirectError } from './redirect.mjs';
import { rethrowNextErrors } from './rethrowNextErrors.mjs';

/**
 * Create a caller that works with Next.js React Server Components & Server Actions
 */ function nextAppDirCaller(config) {
    const { normalizeFormData = true } = config;
    const createContext = async ()=>{
        return config?.createContext?.() ?? {};
    };
    return async (opts)=>{
        const path = config.pathExtractor?.({
            meta: opts._def.meta
        }) ?? '';
        const ctx = await createContext().catch((cause)=>{
            const error = new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create context',
                cause
            });
            throw error;
        });
        const handleError = (cause)=>{
            const error = getTRPCErrorFromUnknown(cause);
            config.onError?.({
                ctx,
                error,
                input: opts.args[0],
                path,
                type: opts._def.type
            });
            rethrowNextErrors(error);
            throw error;
        };
        switch(opts._def.type){
            case 'mutation':
                {
                    /**
         * When you wrap an action with useFormState, it gets an extra argument as its first argument.
         * The submitted form data is therefore its second argument instead of its first as it would usually be.
         * The new first argument that gets added is the current state of the form.
         * @see https://react.dev/reference/react-dom/hooks/useFormState#my-action-can-no-longer-read-the-submitted-form-data
         */ let input = opts.args.length === 1 ? opts.args[0] : opts.args[1];
                    if (normalizeFormData && input instanceof FormData) {
                        input = formDataToObject(input);
                    }
                    return await opts.invoke({
                        type: opts._def.type,
                        ctx,
                        getRawInput: async ()=>input,
                        path,
                        input,
                        signal: undefined
                    }).then((data)=>{
                        if (data instanceof TRPCRedirectError) throw data;
                        return data;
                    }).catch(handleError);
                }
            case 'query':
                {
                    const input = opts.args[0];
                    return await opts.invoke({
                        type: opts._def.type,
                        ctx,
                        getRawInput: async ()=>input,
                        path,
                        input,
                        signal: undefined
                    }).then((data)=>{
                        if (data instanceof TRPCRedirectError) throw data;
                        return data;
                    }).catch(handleError);
                }
            case 'subscription':
            default:
                {
                    throw new TRPCError({
                        code: 'NOT_IMPLEMENTED',
                        message: `Not implemented for type ${opts._def.type}`
                    });
                }
        }
    };
}

export { nextAppDirCaller };
