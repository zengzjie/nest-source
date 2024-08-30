import { Type } from "../type.interface";
import { MiddlewareConfigProxy } from "./middleware-config-proxy.interface";
/**
 * 用于将用户定义的中间件应用于路由的接口定义方法。
 *
 * @see [MiddlewareConsumer](https://docs.nestjs.com/middleware#middleware-consumer)
 */
export interface MiddlewareConsumer {
  /**
   * @param {...(Type | Function)} 中间件类/函数或类/函数数组附在经过的路线上。
   *
   * @returns {MiddlewareConfigProxy}
   */
  apply(...middleware: (Type<any> | Function)[]): MiddlewareConfigProxy;
}
