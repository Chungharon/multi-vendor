'use strict';

var createProxy = require('./createProxy.js');
var formatter = require('./error/formatter.js');
var TRPCError = require('./error/TRPCError.js');
var transformer = require('./transformer.js');
var utils = require('./utils.js');

const lazySymbol = Symbol('lazy');
function once(fn) {
    const uncalled = Symbol();
    let result = uncalled;
    return ()=>{
        if (result === uncalled) {
            result = fn();
        }
        return result;
    };
}
/**
 * Lazy load a router
 * @see https://trpc.io/docs/server/merging-routers#lazy-load
 */ function lazy(importRouter) {
    async function resolve() {
        const mod = await importRouter();
        // if the module is a router, return it
        if (isRouter(mod)) {
            return mod;
        }
        const routers = Object.values(mod);
        if (routers.length !== 1 || !isRouter(routers[0])) {
            throw new Error("Invalid router module - either define exactly 1 export or return the router directly.\nExample: `lazy(() => import('./slow.js').then((m) => m.slowRouter))`");
        }
        return routers[0];
    }
    resolve[lazySymbol] = true;
    return resolve;
}
function isLazy(input) {
    return typeof input === 'function' && lazySymbol in input;
}
function isRouter(value) {
    return utils.isObject(value) && utils.isObject(value['_def']) && 'router' in value['_def'];
}
const emptyRouter = {
    _ctx: null,
    _errorShape: null,
    _meta: null,
    queries: {},
    mutations: {},
    subscriptions: {},
    errorFormatter: formatter.defaultFormatter,
    transformer: transformer.defaultTransformer
};
/**
 * Reserved words that can't be used as router or procedure names
 */ const reservedWords = [
    /**
   * Then is a reserved word because otherwise we can't return a promise that returns a Proxy
   * since JS will think that `.then` is something that exists
   */ 'then',
    /**
   * `fn.call()` and `fn.apply()` are reserved words because otherwise we can't call a function using `.call` or `.apply`
   */ 'call',
    'apply'
];
/**
 * @internal
 */ function createRouterFactory(config) {
    function createRouterInner(input) {
        const reservedWordsUsed = new Set(Object.keys(input).filter((v)=>reservedWords.includes(v)));
        if (reservedWordsUsed.size > 0) {
            throw new Error('Reserved words used in `router({})` call: ' + Array.from(reservedWordsUsed).join(', '));
        }
        const procedures = utils.omitPrototype({});
        const lazy = utils.omitPrototype({});
        function createLazyLoader(opts) {
            return {
                ref: opts.ref,
                load: once(async ()=>{
                    const router = await opts.ref();
                    const lazyPath = [
                        ...opts.path,
                        opts.key
                    ];
                    const lazyKey = lazyPath.join('.');
                    opts.aggregate[opts.key] = step(router._def.record, lazyPath);
                    delete lazy[lazyKey];
                    // add lazy loaders for nested routers
                    for (const [nestedKey, nestedItem] of Object.entries(router._def.lazy)){
                        const nestedRouterKey = [
                            ...lazyPath,
                            nestedKey
                        ].join('.');
                        // console.log('adding lazy', nestedRouterKey);
                        lazy[nestedRouterKey] = createLazyLoader({
                            ref: nestedItem.ref,
                            path: lazyPath,
                            key: nestedKey,
                            aggregate: opts.aggregate[opts.key]
                        });
                    }
                })
            };
        }
        function step(from, path = []) {
            const aggregate = utils.omitPrototype({});
            for (const [key, item] of Object.entries(from ?? {})){
                if (isLazy(item)) {
                    lazy[[
                        ...path,
                        key
                    ].join('.')] = createLazyLoader({
                        path,
                        ref: item,
                        key,
                        aggregate
                    });
                    continue;
                }
                if (isRouter(item)) {
                    aggregate[key] = step(item._def.record, [
                        ...path,
                        key
                    ]);
                    continue;
                }
                if (!isProcedure(item)) {
                    // RouterRecord
                    aggregate[key] = step(item, [
                        ...path,
                        key
                    ]);
                    continue;
                }
                const newPath = [
                    ...path,
                    key
                ].join('.');
                if (procedures[newPath]) {
                    throw new Error(`Duplicate key: ${newPath}`);
                }
                procedures[newPath] = item;
                aggregate[key] = item;
            }
            return aggregate;
        }
        const record = step(input);
        const _def = {
            _config: config,
            router: true,
            procedures,
            lazy,
            ...emptyRouter,
            record
        };
        const router = {
            ...record,
            _def,
            createCaller: createCallerFactory()({
                _def
            })
        };
        return router;
    }
    return createRouterInner;
}
function isProcedure(procedureOrRouter) {
    return typeof procedureOrRouter === 'function';
}
/**
 * @internal
 */ async function getProcedureAtPath(router, path) {
    const { _def } = router;
    let procedure = _def.procedures[path];
    while(!procedure){
        const key = Object.keys(_def.lazy).find((key)=>path.startsWith(key));
        // console.log(`found lazy: ${key ?? 'NOPE'} (fullPath: ${fullPath})`);
        if (!key) {
            return null;
        }
        // console.log('loading', key, '.......');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const lazyRouter = _def.lazy[key];
        await lazyRouter.load();
        procedure = _def.procedures[path];
    }
    return procedure;
}
/**
 * @internal
 */ async function callProcedure(opts) {
    const { type, path } = opts;
    const proc = await getProcedureAtPath(opts.router, path);
    if (!proc || !isProcedure(proc) || proc._def.type !== type && !opts.allowMethodOverride) {
        throw new TRPCError.TRPCError({
            code: 'NOT_FOUND',
            message: `No "${type}"-procedure on path "${path}"`
        });
    }
    /* istanbul ignore if -- @preserve */ if (proc._def.type !== type && opts.allowMethodOverride && proc._def.type === 'subscription') {
        throw new TRPCError.TRPCError({
            code: 'METHOD_NOT_SUPPORTED',
            message: `Method override is not supported for subscriptions`
        });
    }
    return proc(opts);
}
function createCallerFactory() {
    return function createCallerInner(router) {
        const { _def } = router;
        return function createCaller(ctxOrCallback, opts) {
            return createProxy.createRecursiveProxy(async ({ path, args })=>{
                const fullPath = path.join('.');
                if (path.length === 1 && path[0] === '_def') {
                    return _def;
                }
                const procedure = await getProcedureAtPath(router, fullPath);
                let ctx = undefined;
                try {
                    if (!procedure) {
                        throw new TRPCError.TRPCError({
                            code: 'NOT_FOUND',
                            message: `No procedure found on path "${path}"`
                        });
                    }
                    ctx = utils.isFunction(ctxOrCallback) ? await Promise.resolve(ctxOrCallback()) : ctxOrCallback;
                    return await procedure({
                        path: fullPath,
                        getRawInput: async ()=>args[0],
                        ctx,
                        type: procedure._def.type,
                        signal: opts?.signal
                    });
                } catch (cause) {
                    opts?.onError?.({
                        ctx,
                        error: TRPCError.getTRPCErrorFromUnknown(cause),
                        input: args[0],
                        path: fullPath,
                        type: procedure?._def.type ?? 'unknown'
                    });
                    throw cause;
                }
            });
        };
    };
}
function mergeRouters(...routerList) {
    const record = utils.mergeWithoutOverrides({}, ...routerList.map((r)=>r._def.record));
    const errorFormatter = routerList.reduce((currentErrorFormatter, nextRouter)=>{
        if (nextRouter._def._config.errorFormatter && nextRouter._def._config.errorFormatter !== formatter.defaultFormatter) {
            if (currentErrorFormatter !== formatter.defaultFormatter && currentErrorFormatter !== nextRouter._def._config.errorFormatter) {
                throw new Error('You seem to have several error formatters');
            }
            return nextRouter._def._config.errorFormatter;
        }
        return currentErrorFormatter;
    }, formatter.defaultFormatter);
    const transformer$1 = routerList.reduce((prev, current)=>{
        if (current._def._config.transformer && current._def._config.transformer !== transformer.defaultTransformer) {
            if (prev !== transformer.defaultTransformer && prev !== current._def._config.transformer) {
                throw new Error('You seem to have several transformers');
            }
            return current._def._config.transformer;
        }
        return prev;
    }, transformer.defaultTransformer);
    const router = createRouterFactory({
        errorFormatter,
        transformer: transformer$1,
        isDev: routerList.every((r)=>r._def._config.isDev),
        allowOutsideOfServer: routerList.every((r)=>r._def._config.allowOutsideOfServer),
        isServer: routerList.every((r)=>r._def._config.isServer),
        $types: routerList[0]?._def._config.$types
    })(record);
    return router;
}

exports.callProcedure = callProcedure;
exports.createCallerFactory = createCallerFactory;
exports.createRouterFactory = createRouterFactory;
exports.getProcedureAtPath = getProcedureAtPath;
exports.lazy = lazy;
exports.mergeRouters = mergeRouters;
