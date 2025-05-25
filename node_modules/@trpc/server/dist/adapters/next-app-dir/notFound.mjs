import { TRPCError } from '../../unstable-core-do-not-import/error/TRPCError.mjs';
import '../../vendor/unpromise/unpromise.mjs';
import '../../unstable-core-do-not-import/stream/utils/disposable.mjs';
import '../../unstable-core-do-not-import/rootConfig.mjs';

/**
 * Like `next/navigation`'s `notFound()` but throws a `TRPCError` that later will be handled by Next.js
 * @public
 */ const notFound = ()=>{
    throw new TRPCError({
        code: 'NOT_FOUND'
    });
};

export { notFound };
