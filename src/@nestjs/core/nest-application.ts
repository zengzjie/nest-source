import "reflect-metadata";
import express, {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { Logger } from "../common/services/logger";
import {
  CustomParamFactory,
  defineNameSpaceModule,
  ForbiddenException,
  GlobalHttpExceptionFilter,
  isEmptyObject,
  isFunction,
  isModule,
  isObject,
  isString,
  RequestMethod,
  Type,
} from "@nestjs/common";
import path from "path";
import { ParametersMetadata } from "@nestjs/common/interfaces/params";
import {
  CATCH_WATERMARK,
  EXCEPTION_FILTERS_METADATA,
  FILTER_CATCH_EXCEPTIONS,
  GLOBAL_MODULE_METADATA,
  GUARDS_METADATA,
  HEADER_METADATA,
  INJECTABLE_WATERMARK,
  INTERCEPTORS_METADATA,
  NAMESPACE_MODULE_METADATA,
  PARAMETERS_METADATA,
  PARAMETER_CONSTANT,
  PARAMTYPES_METADATA,
  PIPES_METADATA,
  PROPERTY_DEPS_METADATA,
  ROUTE_ARGS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
} from "@nestjs/common/constants";
import {
  MODULE_METADATA,
  PREFIX_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  REDIRECT_URL_METADATA,
  REDIRECT_STATUS_CODE_METADATA,
  HTTP_CODE_METADATA,
  Provider,
  ValueProvider,
  InjectionToken,
  OptionalFactoryDependency,
} from "@nestjs/common";
import { HeaderMetadata } from "@nestjs/common/interfaces/http";
import { CustomParameterMetadataRecord } from "@nestjs/common/utils/assign-custom-metadata.util";
import {
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
  isValueProvider,
} from "@nestjs/common/utils/provider.util";
import { ModuleMetadata } from "@nestjs/common";
import { DynamicModule } from "@nestjs/common";
import { ForwardReference } from "@nestjs/common";
import {
  CanActivate,
  ExecutionContext,
  HttpArgumentsHost,
  ParamType,
  RouteInfo,
} from "@nestjs/common/interfaces";
import { ArgumentsHost } from "@nestjs/common";
import { ClassProvider } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "./constants";
import { PipeTransform } from "@nestjs/common";
import { Reflector } from "./reflector";
import { from, mergeMap, Observable, of } from "rxjs";

export class NestApplication {
  // 在它的内部私有化一个 Express 实例
  private readonly app: Express = express();
  // 在此处保存所有的 provider 的实例 key 就是token，值就是类的实例或者值
  /**
   Map(1) {
    // key => provider.useValue
    'SUFFIX' => 'custom-suffix',
    DogsService => DogsService { name: 'dog' }
   }
   */
  private readonly providerInstances = new Map<InjectionToken, any>();
  // 记录每个模块里有哪些 provider 的 token
  /**
    Map(1) {
      // Module => Set(1) { token }
    }
   */
  private readonly moduleProviders = new Map<
    Type | Promise<DynamicModule> | ForwardReference<any>,
    Set<InjectionToken>
  >();
  // 记录所有的 provider 的 token
  private readonly globalProviders = new Set<InjectionToken>();
  // 收集所有的中间件
  private readonly middlewares = [];
  // 收集需要排除的路由信息
  private readonly excludeRoutes = [];
  // 收集全局过滤器
  private readonly globalFilters = [];
  // 全局异常过滤器
  private readonly defaultGlobalHttpExceptionFilter =
    new GlobalHttpExceptionFilter();
  // 收集全局管道
  private readonly globalPipes = [];
  // 收集全局守卫
  private readonly globalGuards = [];
  // 收集全局拦截器
  private readonly globalInterceptors = [];
  constructor(protected readonly module: Type) {
    // 用来把 JSON 格式的请求体对象放在 req.body 上
    this.app.use(express.json());
    // 把 form 表单格式的请求体对象放在 req.body 上
    this.app.use(express.urlencoded({ extended: true }));
  }

  useGlobalFilters(filter) {
    this.globalFilters.push(filter);
  }

  useGlobalPipes(pipe) {
    this.globalPipes.push(pipe);
  }

  useGlobalGuards(guard) {
    this.globalGuards.push(guard);
  }
  useGlobalInterceptors(interceptor) {
    this.globalInterceptors.push(interceptor);
  }

  private initMiddlewares() {
    this.module.prototype.configure?.(this);
  }

  /**
   * @description: 获取中间件实例
   * @param {*} middleware
   * @return {*}
   */
  private getMiddlewareInstance(middleware) {
    if (middleware instanceof Function) {
      const dependencies = this.resolveDependencies(middleware);
      return new middleware(...dependencies);
    }
    return middleware;
  }

  /**
   * @description: 把传入 forRoutes 的路径信息进行格式化
   * @param {string} route 路径信息
   * @return {*} 返回格式化后的路径和请求方法
   */
  private normalizeRoute(route: string | Type<any> | RouteInfo) {
    let routePath = ""; // 转换路径
    let routeMethod = RequestMethod.ALL; // 请求方法
    if (isString(route)) {
      routePath = route;
    } else if ("path" in route && "method" in route) {
      routePath = route.path;
      routeMethod = route.method ?? RequestMethod.ALL;
    } else {
      // 如果是一个类，则取出类上的元数据
      const prefix = Reflect.getMetadata(PREFIX_METADATA, route) || "";
      routePath = prefix;
    }
    routePath = path.posix.join("/", routePath);
    return { routePath, routeMethod };
  }

  /**
   * @description: 判断是否是排除的路由
   * @param {*} requestPath
   * @param {*} requestMethod
   * @return {*}
   */
  private isExcludeRoute(requestPath, requestMethod) {
    return this.excludeRoutes.some((route) => {
      return (
        route.routePath === requestPath &&
        RequestMethod[requestMethod] === route.routeMethod
      );
    });
  }

  private apply(...middleware): this {
    // 将中间件都定义到 AppModule 上, 用于在调用中间件的时候通过 resolveDependencies 来解析中间件上的依赖并实例化注入
    defineNameSpaceModule(this.module, middleware);
    // 把接收到的中间件放到中间数组中，并且返回当前的实例
    this.middlewares.push(...middleware);
    return this;
  }

  /**
   * @description: 收集需要排除的路由信息
   * @param {array} routes
   * @return {*}
   */
  private exclude(...routes: (string | RouteInfo)[]): this {
    routes.forEach((route) => {
      this.excludeRoutes.push(this.normalizeRoute(route));
    });
    return this;
  }

  private forRoutes(...routes: (string | Type<any> | RouteInfo)[]): this {
    // 遍历路径信息, 为每一个路径信息应用中间件
    for (const route of routes) {
      // 遍历中间件
      for (const middleware of this.middlewares) {
        // 把 route 格式化为标准对象，一个是路径，一个是请求方法
        const { routePath, routeMethod } = this.normalizeRoute(route);
        // use 方法的第一个参数就表示匹配的路径，如果不匹配的话就不会执行后面的中间件
        this.app.use(routePath, (req, res, next) => {
          if (this.isExcludeRoute(req.originalUrl, req.method)) {
            // 如果是排除的路由，则直接跳过
            return next();
          }
          if (
            routeMethod === RequestMethod.ALL ||
            Number(`${routeMethod}`) === RequestMethod[req.method]
          ) {
            // 此处 middleware 可能是一个类或者是一个实例，也可能是一个函数
            if ("use" in middleware.prototype || "use" in middleware) {
              const middlewareInstance = this.getMiddlewareInstance(middleware);
              middlewareInstance.use(req, res, next);
            } else if (middleware instanceof Function) {
              middleware(req, res, next);
            } else {
              next();
            }
          } else {
            next();
          }
        });
      }
    }
    // 确保链式调用的时候一组 apply(x1).forRoutes(c1) 之后再调用 apply(x2).forRoutes(c2) 时，x1 不会应用到 c2 上
    this.middlewares.length = 0;
    return this;
  }
  /**
   * @description: 对最顶层的 Module 进行初始化操作
   * @return {*}
   */
  private async initProviders(module) {
    // 取出模块里所有的导入的模块
    const imports: ModuleMetadata["imports"] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) ?? [];

    try {
      for (let importedModule of imports) {
        const injectable = Reflect.getMetadata(
          INJECTABLE_WATERMARK,
          importedModule
        );
        if (injectable) {
          throw new Error();
        }

        let importedModuleSubset = importedModule;
        if (importedModuleSubset instanceof Promise) {
          importedModuleSubset = await importedModuleSubset;
        }
        // 如果 module 在 importedModuleSubset 中，则代表是一个动态模块
        if ("module" in importedModuleSubset) {
          const {
            module: dynamicModule,
            imports: dynamicModuleImports = [],
            providers = [],
            controllers = [],
            exports = [],
          } = importedModuleSubset;
          // 如果是动态模块则需要将动态模块里的 providers, controllers, exports 跟当前 @Module 装饰器中的 providers, controllers, exports 合并
          const oldImports =
            Reflect.getMetadata(MODULE_METADATA.IMPORTS, dynamicModule) ?? [];
          const oldProviders =
            Reflect.getMetadata(MODULE_METADATA.PROVIDERS, dynamicModule) ?? [];
          const oldControllers =
            Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, dynamicModule) ??
            [];
          const oldExports =
            Reflect.getMetadata(MODULE_METADATA.EXPORTS, dynamicModule) ?? [];

          // 重新定义元数据
          Reflect.defineMetadata(
            MODULE_METADATA.IMPORTS,
            [...oldImports, ...dynamicModuleImports],
            dynamicModule
          );
          Reflect.defineMetadata(
            MODULE_METADATA.PROVIDERS,
            [...oldProviders, ...providers],
            dynamicModule
          );
          Reflect.defineMetadata(
            MODULE_METADATA.CONTROLLERS,
            [...oldControllers, ...controllers],
            dynamicModule
          );
          Reflect.defineMetadata(
            MODULE_METADATA.EXPORTS,
            [...oldExports, ...exports],
            dynamicModule
          );
          this.registerProvidersFromModule(dynamicModule, module);
        } else {
          this.registerProvidersFromModule(importedModuleSubset, module);
        }
      }
    } catch (error) {
      Logger.error(
        "Classes annotated with @Injectable(), @Catch(), and @Controller() decorators must not appear in the 'imports' array of a module.",
        error.stack
      );
      process.exit(1);
    }

    // 取出模块里所有的服务
    const providers: Provider[] =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) ?? [];
    for (let provider of providers) {
      this.addProvider(provider, module);
    }
  }

  private registerProvidersFromModule(
    module: Type | Promise<DynamicModule> | ForwardReference<any>,
    ...parentModules: (Type | Promise<DynamicModule> | ForwardReference<any>)[]
  ) {
    // 拿到模块里的所有导入的模块
    // const importedModules =
    //   Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) ?? [];
    const global = Reflect.getMetadata(GLOBAL_MODULE_METADATA, module);
    // 拿到模块里的所有导入的服务
    const importedProviders =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) ?? [];
    // 拿到模块里的所有导出的服务
    const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, module) ?? [];
    // 拿到模块里的所有导入模块
    const imports: ModuleMetadata["imports"] =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) ?? [];

    if (imports.length > 0) {
      this.initProviders(module);
    }

    // useValue 比较特殊，不需要手动导出去进行注入
    importedProviders.forEach((provider) => {
      if (isValueProvider(provider)) {
        [module, ...parentModules].forEach((m) => {
          this.addProvider(provider, m, global);
        });
      }
    });

    // if (exports.length === 0) {
    // 如果没有导出服务，则手动导出所有导入的服务
    // exports.push(...importedProviders);
    // }

    // 根据导出服务判断其是否是模块，如果是模块则递归解析其 @Module 装饰器中的 providers
    for (let exportedProvider of exports) {
      if (isModule(exportedProvider)) {
        // 递归初始化
        this.registerProvidersFromModule(
          exportedProvider,
          module,
          ...parentModules
        );
      } else {
        // 如果不是模块，则把导出的服务和导入的服务进行对比，只有 token 相等的时候才会注册
        // 这里的 useValue 比较特殊，不需要手动导出去进行注入
        importedProviders.forEach((provider) => {
          if (
            provider === exportedProvider ||
            provider.provide === exportedProvider
          ) {
            [module, ...parentModules].forEach((m) => {
              this.addProvider(provider, m, global);
            });
          }
        });
      }
    }

    this.initController(module);
  }

  private addProvider(
    provider: Provider,
    module: Type | Promise<DynamicModule> | ForwardReference<any>,
    global = false
  ) {
    // 需要将每个 provider 注册到对应的模块里去
    // providers 在 global 为 true 时，就是 this.globalProviders (Set)
    // providers 在 global 为 false 时，就是 module 对应的 this.moduleProviders (Map)
    const providers = global
      ? this.globalProviders
      : this.moduleProviders.get(module) ?? new Set<InjectionToken>();

    if (!global && !this.moduleProviders.has(module)) {
      console.log(
        module,
        this.moduleProviders,
        this.providerInstances,
        "module----module"
      );
      this.moduleProviders.set(module, providers);
    }

    // 为了避免重复注册，这里需要判断一下是否已经注册过了
    let token;
    // 需要排除掉 APP_FILTER, APP_PIPE, APP_GUARD, APP_INTERCEPTOR 这几个特殊的 token
    if (
      isClassProvider(provider) ||
      isValueProvider(provider) ||
      isFactoryProvider(provider) ||
      isExistingProvider(provider)
    ) {
      token = provider.provide;
    } else {
      token = provider;
    }
    // 如果实例池里已经有此 token 对应的实例了
    if (this.providerInstances.has(token) && !["APP_FILTER", "APP_PIPE", "APP_GUARD", "APP_INTERCEPTOR"].includes(
      (provider as ClassProvider).provide as string
    )) {
      // 如果 providers 里已经有这个 token 了，则无需再次注册
      if (!providers.has(token)) {
        providers.add(token);
      }
      return;
    }

    switch (true) {
      case isClassProvider(provider):
        // provider.useClass 是一个类并且有构造函数参数，需要解析构造函数参数并实例化后注入
        // 调用 resolveDependencies 方法传入 useClass 类，解析出 useClass 类的依赖
        const dependencies = this.resolveDependencies(provider.useClass);
        const classInstance = new provider.useClass(...dependencies);
        if (provider.provide === APP_FILTER) {
          this.useGlobalFilters(classInstance);
        }
        if (provider.provide === APP_PIPE) {
          this.useGlobalPipes(classInstance);
        }
        if (provider.provide === APP_GUARD) {
          this.useGlobalGuards(classInstance);
        }
        if (provider.provide === APP_INTERCEPTOR) {
          this.useGlobalInterceptors(classInstance);
        }
        // 把 provider 的 token 和类实例保存到 providersMap 中
        this.providerInstances.set(provider.provide, classInstance);
        providers.add(provider.provide);
        break;
      case isValueProvider(provider):
        // 提供的是一个值，则不需要容器帮助实例化，直接使用此值注册即可
        this.providerInstances.set(provider.provide, provider.useValue);
        providers.add(provider.provide);
        break;
      case isFactoryProvider(provider):
        // inject 是 InjectionToken | OptionalFactoryDependency[]，如果是 InjectionToken 则直接取出每一项去 providersMap 中取值
        const inject = provider.inject ?? [];
        const injectValues = inject.map(this.getProviderByToken.bind(this));

        // 将解析好的 inject 依赖值按序传入 useFactory 函数，生成实例
        this.providerInstances.set(
          provider.provide,
          provider.useFactory(...injectValues)
        );
        providers.add(provider.provide);
        break;
      case isExistingProvider(provider):
        this.providerInstances.set(
          provider.provide,
          new provider.useExisting()
        );
        providers.add(provider.provide);
        break;
      case isFunction(provider):
        // 这里也需要递归解析依赖
        const dependencyResolution = this.resolveDependencies(provider);
        // 只提供了一个类，token 是这个类，值是这个类的实例
        this.providerInstances.set(
          provider,
          new provider(...dependencyResolution)
        );
        providers.add(provider);
        break;
      default:
        break;
    }

    console.log(
      provider,
      module,
      this.moduleProviders,
      this.providerInstances,
      this.globalProviders,
      "this.moduleProviders--last"
    );
  }

  /**
   * @description: 通过 moduleProviders 获取对应的 token Set, 在判断此 token 是否存在于此 Set 中，如果存在则从 providerInstances 中取出对应的实例，否则直接返回 token
   * @param {InjectionToken} token
   * @return {*}
   */
  private getProviderByToken(
    token: InjectionToken | OptionalFactoryDependency,
    module: Type
  ) {
    if (isObject(token)) {
      // useFactory 的 inject 为 OptionalFactoryDependency 情况
      const { token: factoryToken, optional } =
        token as OptionalFactoryDependency;
      const hasToken = this.moduleProviders.get(module)?.has(factoryToken);
      const provider = hasToken
        ? this.providerInstances.get(factoryToken) ?? factoryToken
        : void 0;
      if (!provider && !optional) {
        throw new Error(`No provider found for ${String(factoryToken)}`);
      }
      // optional 为 true 时，如果没有找到 provider，则返回 undefined
      if (optional && !provider) {
        return undefined;
      }
      return provider;
    }

    console.log(
      this.moduleProviders,
      this.globalProviders,
      token,
      "this.moduleProviders ======> this.moduleProviders"
    );

    const hasToken =
      this.moduleProviders.get(module)?.has(token as InjectionToken) ||
      this.globalProviders.has(token as InjectionToken);

    return hasToken
      ? this.providerInstances.get(token as InjectionToken)
      : null;
  }

  /**
   * @description: 解析控制器的依赖
   * @param {*} Clazz 可以是 Controller，也可以是 Service -> useClass 中定义的类
   * @return {*}
   */
  private resolveDependencies(Clazz) {
    const module = Reflect.getMetadata(NAMESPACE_MODULE_METADATA, Clazz);
    console.log(Clazz, module, "🤡Clazz");

    // 获取构造函数参数的元数据 -> { index: 0, param: 'CatsService' }
    const selfParamtypes =
      Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, Clazz) ?? [];
    console.log(selfParamtypes, "selfParamtypes");

    // 获取属性的元数据 -> { key: 'catsService', type: CatsService }
    const selfPropertiesMetadata =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, Clazz) ?? [];
    console.log(selfPropertiesMetadata, "selfPropertiesMetadata");

    // 如果 selfPropertiesMetadata 有值，则解析属性依赖并附值
    if (selfPropertiesMetadata.length) {
      for (const property of selfPropertiesMetadata) {
        const { key, type } = property;
        const provider = this.getProviderByToken(type, module);
        // 把 provider 附值给 Clazz 的属性
        Clazz.prototype[key] = provider;
      }
    }

    // 获取类的构造函数的元数据 -> [Class A, Class B]
    const designParamtypes =
      Reflect.getMetadata(PARAMTYPES_METADATA, Clazz) ?? [];
    console.log(designParamtypes, "designParamtypes====designParamtypes");

    // 从 providersMap 中取出对应的实例
    return designParamtypes.map((paramType, i) => {
      // selfParamtypes 中的index 和 designParamtypes 中的下标是一一对应的，这样就可以保证依赖参数的顺序是不会乱的
      const matchedParamType = selfParamtypes?.find((item) => item.index === i);
      if (matchedParamType) {
        // 只有使用了 @Inject 装饰器，才会进来
        return this.getProviderByToken(matchedParamType.param, module);
      } else {
        // 否则直接取出对应的实例
        return this.getProviderByToken(paramType, module);
      }
    });
  }

  /**
   * @description: 获取守卫实例
   * @param {*} guard
   * @return {*}
   */
  private getGuardsInstance(guard) {
    if (guard instanceof Function) {
      const dependencies = this.resolveDependencies(guard);
      return new guard(...dependencies);
    }
    return guard;
  }

  /**
   * @description: 校验守卫
   * @param {*} guards
   * @param {*} context
   * @return {*}
   */
  private async callGuards(guards, context) {
    for (let guard of guards) {
      const instance = this.getGuardsInstance(guard) as CanActivate;
      if (instance) {
        const validateGuard = await instance.canActivate(context);
        if (!validateGuard) {
          throw new ForbiddenException("Forbidden resource");
        }
      }
    }
  }

  /**
   * @description: 获取拦截器实例
   * @param {*} guard
   * @return {*}
   */
  private getInterceptorInstance(interceptor) {
    if (interceptor instanceof Function) {
      const dependencies = this.resolveDependencies(interceptor);
      return new interceptor(...dependencies);
    }
    return interceptor;
  }

  /**
   * @description: 执行所有的拦截器（🧅 利用的是洋葱模型的顺序来执行）
   * @param {*} controller
   * @param {*} method
   * @param {*} args
   * @param {*} interceptors
   * @param {*} context
   * @return {*}
   */
  private async callInterceptors(
    controller,
    method,
    args,
    interceptors,
    context
  ) {
    const nextCallback = (i = 0): Observable<any> => {
      if (i >= interceptors.length) {
        const result = method.call(controller, ...args) as
          | Promise<string>
          | string;
        return result instanceof Promise ? from(result) : of(result);
      }
      const next = {
        handle: () => nextCallback(i + 1),
      };
      const interceptor = interceptors[i];
      const instance = this.getInterceptorInstance(interceptor);
      const result = instance.intercept(context, next) as
        | Observable<any>
        | Promise<Observable<any>>;
      return from(result).pipe(
        mergeMap((value) => (value instanceof Observable ? value : of(value)))
      );
    };
    return nextCallback();
  }

  private initDefaultProviders() {
    this.addProvider(Reflector, this.module, true);
  }

  // 配置初始化工作
  private async initController(module) {
    // 全局使用的依赖初始化注入
    this.initDefaultProviders();
    // 取出模块里所有的控制器，然后实例化它们做好路由配置
    const controllers: Type[] =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module) ?? [];
    // 初始化模块的依赖
    Logger.log(
      `${this.module.name} dependencies initialized`,
      "InstanceLoader"
    );
    /**
     * 路由映射的核心逻辑
     * 知道有什么样的请求方法，请求路径，请求处理函数
     */
    for (let Controller of controllers) {
      // 解析出控制器的依赖
      const dependencies = this.resolveDependencies(Controller);
      console.log(dependencies, "dependencies");

      // 创建每个控制器的实例
      const controller = new Controller(...dependencies);
      // 获取控制器的路径前缀
      const prefix = Reflect.getMetadata(PREFIX_METADATA, Controller) || "";
      // 获取控制器上的过滤器
      const controllerFilters =
        Reflect.getMetadata(EXCEPTION_FILTERS_METADATA, Controller) ?? [];
      const controllerPipes =
        Reflect.getMetadata(PIPES_METADATA, Controller) ?? [];
      // 获取控制器上的守卫
      const controllerGuards =
        Reflect.getMetadata(GUARDS_METADATA, Controller) ?? [];
      // 获取控制器上的拦截器
      const controllerInterceptors =
        Reflect.getMetadata(INTERCEPTORS_METADATA, Controller) ?? [];
      // 把控制器过滤器放到模块的命名空间中
      defineNameSpaceModule(this.module, controllerFilters);
      // 把控制器管道放到模块的命名空间中
      defineNameSpaceModule(this.module, controllerPipes);
      // 把控制器守卫放到模块的命名空间中
      defineNameSpaceModule(this.module, controllerGuards);
      // 把控制器拦截器放到模块的命名空间中
      defineNameSpaceModule(this.module, controllerInterceptors);
      // 开始解析路由
      Logger.log(`${Controller.name} {${prefix}}:`, "RoutesResolver");

      // 获取控制器原型对象
      const controllerPrototype = Controller.prototype;
      // 遍历控制器原型对象的属性名称
      for (const methodName of Object.getOwnPropertyNames(
        controllerPrototype
      )) {
        // 获取原型上的方法 -> 例如 index 方法
        const method = controllerPrototype[methodName];
        // 获取对应方法上的元数据 -> 拿到对应的方式类型（ GET/POST... ）
        const httpMethod = Reflect.getMetadata(METHOD_METADATA, method);
        // 如果没有获取到方法类型，直接跳过
        if (!httpMethod) {
          continue;
        }
        // 获取对应方法上的元数据 -> 拿到对应的路径（ @Get('cat') -> cat）
        const pathMetadata = Reflect.getMetadata(PATH_METADATA, method);

        // 获取重定向的路径
        const redirectUrl = Reflect.getMetadata(REDIRECT_URL_METADATA, method);
        // 获取重定向的状态码
        const redirectStatusCode = Reflect.getMetadata(
          REDIRECT_STATUS_CODE_METADATA,
          method
        );

        // 获取 HttpCode 的状态码
        const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, method);

        // 获取 Header 的元数据
        const headerMetadata =
          (Reflect.getMetadata(HEADER_METADATA, method) as HeaderMetadata[]) ??
          [];

        // 获取方法上的过滤器
        const methodFilters =
          Reflect.getMetadata(EXCEPTION_FILTERS_METADATA, method) ?? [];
        // 获取方法上的管道
        const methodPipes = Reflect.getMetadata(PIPES_METADATA, method) ?? [];
        // 获取方法上的守卫
        const methodGuards = Reflect.getMetadata(GUARDS_METADATA, method) ?? [];
        // 获取方法上的拦截器
        const methodInterceptors =
          Reflect.getMetadata(INTERCEPTORS_METADATA, method) ?? [];
        // 把方法过滤器放到模块的命名空间中
        defineNameSpaceModule(this.module, methodFilters);
        // 把方法管道放到模块的命名空间中
        defineNameSpaceModule(this.module, methodPipes);
        // 把方法守卫放到模块的命名空间中
        defineNameSpaceModule(this.module, methodGuards);
        // 把方法拦截器放到模块的命名空间中
        defineNameSpaceModule(this.module, methodInterceptors);

        const mergeFilters = [...controllerFilters, ...methodFilters];
        const mergePipes = [
          ...this.globalPipes,
          ...controllerPipes,
          ...methodPipes,
        ];
        const mergeGuards = [
          ...this.globalGuards,
          ...controllerGuards,
          ...methodGuards,
        ];
        const mergeInterceptors = [
          ...this.globalInterceptors,
          ...controllerInterceptors,
          ...methodInterceptors,
        ];

        // 拼接完整请求路径
        const routePath = path.posix.join("/", prefix, pathMetadata);
        // 配置路由，当客户端以 httpMethod 方法请求 routePath 路径时，会由对应的函数进行处理
        this.app[httpMethod.toLowerCase()](
          routePath,
          async (
            req: ExpressRequest,
            res: ExpressResponse,
            next: NextFunction
          ) => {
            const host = {
              switchToHttp: (): HttpArgumentsHost => ({
                getRequest: <ExpressRequest>() => req as ExpressRequest,
                getResponse: <ExpressResponse>() => res as ExpressResponse,
                getNext: <NextFunction>() => next as NextFunction,
              }),
            };
            const context = {
              ...host,
              getClass: () => Controller,
              getHandler: () => method,
            };

            try {
              // 在执行完中间件逻辑后校验守卫
              await this.callGuards(mergeGuards, context);
              const args = await this.resolveParams(
                controllerPrototype,
                methodName,
                host as any,
                mergePipes
              );

              (
                await this.callInterceptors(
                  controller,
                  method,
                  args,
                  mergeInterceptors,
                  context
                )
              ).subscribe({
                next: (result) => {
                  // 设置响应头
                  headerMetadata.forEach(({ name, value }) => {
                    res.setHeader(name, value);
                  });
                  // 执行路由处理函数，获取返回值
                  // const result = method.call(controller, ...args);
                  if (result?.url) {
                    return res.redirect(result.statusCode || 302, result.url);
                  }
                  if (redirectUrl) {
                    return res.redirect(redirectStatusCode || 302, redirectUrl);
                  }
                  // 如果有 HttpCode 的状态码，则设置响应状态码，否则 POST 请求默认返回 201
                  if (httpCode) {
                    res.statusCode = httpCode;
                  } else if (httpMethod === "POST") {
                    res.statusCode = 201;
                  }
                  // 判断 controller 原型上的 methodName 方法里有没有使用 Response，Res，Next 参数装饰器，如果用了任何一个则不发响应
                  const responseMeta = this.getResponseMeta(
                    controllerPrototype,
                    methodName
                  );

                  // 如果没有使用 Response 或 Res 参数装饰器，或者使用了 Response，Res，Next 参数装饰器并且配置了 passthrough 为 true，则把返回值序列化发回给客户
                  if (
                    !responseMeta ||
                    responseMeta.extraParams?.resConfiguration.passthrough
                  ) {
                    // 把返回值序列化发回给客户
                    res.send(result);
                  }
                },
                error: async error => await this.callExceptionFilters(error, host, mergeFilters)
              });
            } catch (error) {
              await this.callExceptionFilters(error, host, mergeFilters);
            }
          }
        );
        Logger.log(
          `Mapped {${routePath}，${httpMethod}} route`,
          "RoutesResolver"
        );
      }
      Logger.log("Nest application successfully started", NestApplication.name);
    }
  }

  private getPipeInstance(pipe) {
    if (pipe instanceof Function) {
      const dependencies = this.resolveDependencies(pipe);
      return new pipe(...dependencies);
    }
    return pipe;
  }

  private getFilterInstance(filter) {
    if (filter instanceof Function) {
      const dependencies = this.resolveDependencies(filter);
      return new filter(...dependencies);
    }
    return filter;
  }

  /**
   * @description: 捕获异常并根据异常类型优先级来执行对应的异常过滤器
   * @param {*} error
   * @param {*} host
   * @param {*} mergeFilters
   * @return {*}
   */
  private callExceptionFilters(error, host, mergeFilters) {
    const allFilters = [
      ...mergeFilters,
      ...this.globalFilters,
      this.defaultGlobalHttpExceptionFilter,
    ];

    for (let filter of allFilters) {
      console.log(filter, "callExceptionFilters");
      const filterInstance = this.getFilterInstance(filter);
      const catchWatermark = Reflect.getMetadata(
        CATCH_WATERMARK,
        filterInstance.constructor
      );
      const filterCatchExceptions =
        Reflect.getMetadata(
          FILTER_CATCH_EXCEPTIONS,
          filterInstance.constructor
        ) ?? [];

      // catchWatermark 为true 且 filterCatchExceptions 有值则代表着过滤器是特殊的异常过滤器，只会处理 filterCatchExceptions 里的异常

      // ❗️TODO: 这里调试一下看看单独使用了 @Catch() 和 @Catch(Exception) 到底是传染性的执行还是说只执行特定的异常
      if (
        catchWatermark ||
        (filterCatchExceptions?.length > 0 &&
          filterCatchExceptions?.includes(error.constructor))
      ) {
        filterInstance.catch(error, host);
        break;
      }
      // 如果没有 catchWatermark 且 filterCatchExceptions 为空，则代表着过滤器是全局异常过滤器，会处理所有异常
      filter.catch(error, host);
    }
  }

  private getResponseMeta(example, methodName) {
    const parametersMeta = (Reflect.getMetadata(
      PARAMETERS_METADATA,
      example,
      methodName
    ) ?? []) as ParametersMetadata[];
    return parametersMeta
      .filter(Boolean)
      .find(
        (parameter) =>
          parameter.factoryName === PARAMETER_CONSTANT.RES ||
          parameter.factoryName === PARAMETER_CONSTANT.RESPONSE ||
          parameter.factoryName === PARAMETER_CONSTANT.NEXT
      );
  }

  private resolveParams(
    example,
    methodName,
    host: ArgumentsHost,
    mergePipes: PipeTransform[]
  ) {
    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse();
    const next = host.switchToHttp().getNext();
    const mergeParams = [];
    const customParamsFactoryMetadata = (Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      example,
      methodName
    ) ?? {}) as CustomParameterMetadataRecord;
    // 自定义参数工厂
    Object.keys(customParamsFactoryMetadata).map((key) => {
      const factory = customParamsFactoryMetadata[key].factory;
      const data = customParamsFactoryMetadata[key].data;
      const result = factory(data, host);
      mergeParams.push({
        index: customParamsFactoryMetadata[key].index,
        result,
      });
    });

    // 获取参数的元数据
    const paramsMetadata = (Reflect.getMetadata(
      PARAMETERS_METADATA,
      example,
      methodName
    ) ?? []) as ParametersMetadata[];

    // 先按照参数的索引排序（[ { index: 0, factoryName: 'Req' }, undefined 这是没有装饰器修饰的, { index: 1, factoryName: 'Request' } ]）
    const parameterResult = paramsMetadata
      // .filter(Boolean)
      .map((paramMetadata) => {
        const { factoryName, extraParams, index, pipes } = paramMetadata;
        const _mergePipes = [...mergePipes, ...pipes];
        switch (factoryName) {
          case PARAMETER_CONSTANT.REQUEST:
          case PARAMETER_CONSTANT.REQ:
            // [req, ...args]
            return {
              index,
              pipes: _mergePipes,
              result: req,
            };
          case PARAMETER_CONSTANT.RESPONSE:
          case PARAMETER_CONSTANT.RES:
            return {
              index,
              pipes: _mergePipes,
              result: res,
            };
          case PARAMETER_CONSTANT.NEXT:
            return {
              index,
              pipes: _mergePipes,
              result: next,
            };
          case PARAMETER_CONSTANT.QUERY:
            return extraParams.queryKey
              ? {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.QUERY,
                  data: extraParams.queryKey,
                  result: req.query[extraParams.queryKey],
                }
              : {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.QUERY,
                  result: req.query,
                };
          case PARAMETER_CONSTANT.HEADERS:
            return extraParams.headerKey
              ? {
                  index,
                  pipes: _mergePipes,
                  result: req.headers[extraParams.headerKey],
                }
              : {
                  index,
                  pipes: _mergePipes,
                  result: req.headers,
                };
          case PARAMETER_CONSTANT.IP:
            return {
              index,
              pipes: _mergePipes,
              result: req.ip,
            };
          case PARAMETER_CONSTANT.SESSION:
            return {
              index,
              pipes: _mergePipes,
              result: req.session,
            };
          case PARAMETER_CONSTANT.PARAM:
            return extraParams.paramKey
              ? {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.PARAM,
                  data: extraParams.paramKey,
                  result: req.params[extraParams.paramKey],
                }
              : {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.PARAM,
                  result: req.params,
                };
          case PARAMETER_CONSTANT.BODY:
            return extraParams.bodyKey
              ? {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.BODY,
                  data: extraParams.bodyKey,
                  result: req.body[extraParams.bodyKey],
                }
              : {
                  index,
                  pipes: _mergePipes,
                  type: PARAMETER_CONSTANT.BODY,
                  result: req.body,
                };
          // 使用 never 类型，确保所有的情况都被处理
          default:
            const n: never = factoryName;
            return null;
        }
      });

    if (isEmptyObject(customParamsFactoryMetadata)) {
      // 获取方法的参数类型
      const paramtypes = Reflect.getMetadata(
        PARAMTYPES_METADATA,
        example,
        methodName
      );

      // 通过 Promise.all 来并发处理方法的参数装饰器结果
      return Promise.all(
        parameterResult.map(async (param) => {
          let result: any;

          // 如果参数装饰器中有 pipes, 则需要先将参数装饰器结果值传入管道中依次处理
          for (let pipe of param.pipes) {
            if (isObject(result) && typeof result.then === "function") {
              result = await result;
            }
            const pipeInstance: PipeTransform = this.getPipeInstance(pipe);
            // 传入管道接口方法 transform 需要的参数（value, metadata）,得到最终的处理结果并返回到方法的参数中
            result = pipeInstance.transform(result ?? param.result, {
              type: (param.type?.toLocaleLowerCase() as ParamType) ?? "custom",
              metatype: paramtypes[param.index],
              data: param.data ?? void 0,
            });
          }
          return result;
        })
      );
    } else {
      const sortedParams = [...mergeParams, ...parameterResult]
        ?.sort((a, b) => a.index - b.index)
        .filter(Boolean);
      return sortedParams?.map((param) => param?.result);
    }
  }

  // 注册中间件
  use(middleware) {
    this.app.use(middleware);
  }

  // 启动 HTTP 服务器
  async listen(port: number | string, callback: () => void) {
    await this.initProviders(this.module);
    // 初始化中间件
    await this.initMiddlewares();
    await this.initController(this.module);
    // 调用 express 实例的 listen 方法启动一个 HTTP 服务器，监听 port 端口
    this.app.listen(+port, callback);
  }
}
