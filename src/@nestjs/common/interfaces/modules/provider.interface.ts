import { Type } from "../type.interface";
import { InjectionToken } from "./injection-token.interface";
import { OptionalFactoryDependency } from "./optional-factory-dependency.interface";

export type Provider<T = any> =
  | Type<any>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

/**
 * 定义*Value*类型提供程序的接口
 *
 * For example:
 * ```typescript
 * const connectionProvider = {
 *   provide: 'CONNECTION',
 *   useValue: connection,
 * };
 * ```
 * @see [Value providers](https://docs.nestjs.com/fundamentals/custom-providers#value-providers-usevalue)
 */
export interface ValueProvider<T = any> {
  /**
   * 注入令牌
   */
  provide: InjectionToken;
  /**
   * Instance of a provider to be injected.
   */
  useValue: T;
  /**
   * 此选项仅适用于工厂供应商！
   *
   * @see [Use factory](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)
   */
  inject?: never;
}

/**
 * 定义*Class*类型提供程序的接口
 *
 * For example:
 * ```typescript
 * const configServiceProvider = {
 * provide: ConfigService,
 * useClass:
 *   process.env.NODE_ENV === 'development'
 *     ? DevelopmentConfigService
 *     : ProductionConfigService,
 * };
 * ```
 * @see [Class providers](https://docs.nestjs.com/fundamentals/custom-providers#class-providers-useclass)
 * @see [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
 */

export interface ClassProvider<T = any> {
  /**
   * 注入令牌
   */
  provide: InjectionToken;
  /**
   * 提供程序（要注入的实例）的类型（类名）
   */
  useClass: Type<T>;
  /**
   * 此选项仅适用于工厂供应商！
   *
   * @see [Use factory](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)
   */
  inject?: never;
}

/**
 * 定义*Factory*类型提供程序的接口
 *
 * For example:
 * ```typescript
 * const connectionFactory = {
 *   provide: 'CONNECTION',
 *   useFactory: (optionsProvider: OptionsProvider) => {
 *     const options = optionsProvider.get();
 *     return new DatabaseConnection(options);
 *   },
 *   inject: [OptionsProvider],
 * };
 * ```
 * @see [Factory providers](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)
 * @see [Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
 */
export interface FactoryProvider<T = any> {
  /**
   * 注入令牌
   */
  provide: InjectionToken;
  /**
   * 返回要注入的提供程序实例的工厂函数
   */
  useFactory: (...args: any[]) => T | Promise<T>;
  /**
   * 要注入到Factory函数上下文中的提供程序的可选列表
   */
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

/**
 * 定义*Existing*（别名）类型提供程序的接口
 *
 * For example:
 * ```typescript
 * const loggerAliasProvider = {
 *   provide: 'AliasedLoggerService',
 *   useExisting: LoggerService
 * };
 * ```
 *
 * @see [Alias providers](https://docs.nestjs.com/fundamentals/custom-providers#alias-providers-useexisting)
 */
export interface ExistingProvider<T = any> {
  /**
   * 注入令牌
   */
  provide: InjectionToken;
  /**
   * 要被注入令牌别名的提供程序
   */
  useExisting: any;
}
