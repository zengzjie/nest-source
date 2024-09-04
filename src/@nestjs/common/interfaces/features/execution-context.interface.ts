import { Type } from "@nestjs/common";
import { ArgumentsHost } from "./arguments-host.interface";

export interface ExecutionContext extends ArgumentsHost {
  /**
   * 返回当前处理程序所属的控制器类的type
   */
  getClass<T = any>(): Type<T>;
  /**
   * 返回对请求管道中下一个将被调用的处理程序（方法）的引用
   */
  getHandler(): Function;
}
