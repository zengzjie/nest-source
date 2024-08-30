import { Type } from "@nestjs/common";
import { ArgumentsHost } from "./arguments-host.interface";

export interface ExecutionContext extends ArgumentsHost {
  /**
   * 返回当前处理程序所属的控制器类的type
   */
  getClass<T = any>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
