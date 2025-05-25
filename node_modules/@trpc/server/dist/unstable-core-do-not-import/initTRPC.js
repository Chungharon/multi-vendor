'use strict';

var formatter = require('./error/formatter.js');
var middleware = require('./middleware.js');
var procedureBuilder = require('./procedureBuilder.js');
var rootConfig = require('./rootConfig.js');
var router = require('./router.js');
var transformer = require('./transformer.js');

class TRPCBuilder {
    /**
   * Add a context shape as a generic to the root object
   * @see https://trpc.io/docs/v11/server/context
   */ context() {
        return new TRPCBuilder();
    }
    /**
   * Add a meta shape as a generic to the root object
   * @see https://trpc.io/docs/v11/quickstart
   */ meta() {
        return new TRPCBuilder();
    }
    /**
   * Create the root object
   * @see https://trpc.io/docs/v11/server/routers#initialize-trpc
   */ create(opts) {
        const config = {
            ...opts,
            transformer: transformer.getDataTransformer(opts?.transformer ?? transformer.defaultTransformer),
            isDev: opts?.isDev ?? // eslint-disable-next-line @typescript-eslint/dot-notation
            globalThis.process?.env['NODE_ENV'] !== 'production',
            allowOutsideOfServer: opts?.allowOutsideOfServer ?? false,
            errorFormatter: opts?.errorFormatter ?? formatter.defaultFormatter,
            isServer: opts?.isServer ?? rootConfig.isServerDefault,
            /**
       * These are just types, they can't be used at runtime
       * @internal
       */ $types: null
        };
        {
            // Server check
            const isServer = opts?.isServer ?? rootConfig.isServerDefault;
            if (!isServer && opts?.allowOutsideOfServer !== true) {
                throw new Error(`You're trying to use @trpc/server in a non-server environment. This is not supported by default.`);
            }
        }
        return {
            /**
       * Your router config
       * @internal
       */ _config: config,
            /**
       * Builder object for creating procedures
       * @see https://trpc.io/docs/v11/server/procedures
       */ procedure: procedureBuilder.createBuilder({
                meta: opts?.defaultMeta
            }),
            /**
       * Create reusable middlewares
       * @see https://trpc.io/docs/v11/server/middlewares
       */ middleware: middleware.createMiddlewareFactory(),
            /**
       * Create a router
       * @see https://trpc.io/docs/v11/server/routers
       */ router: router.createRouterFactory(config),
            /**
       * Merge Routers
       * @see https://trpc.io/docs/v11/server/merging-routers
       */ mergeRouters: router.mergeRouters,
            /**
       * Create a server-side caller for a router
       * @see https://trpc.io/docs/v11/server/server-side-calls
       */ createCallerFactory: router.createCallerFactory()
        };
    }
}
/**
 * Builder to initialize the tRPC root object - use this exactly once per backend
 * @see https://trpc.io/docs/v11/quickstart
 */ const initTRPC = new TRPCBuilder();

exports.initTRPC = initTRPC;
