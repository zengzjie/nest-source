import { PREFIX_METADATA } from "@nestjs/common/constants";
import "reflect-metadata";

export interface ControllerOptions {
  /**
   * 指定可选的“路由路径前缀”。前缀预挂载到每个控制器请求路径上。
   */
  path?: string | string[];
  /**
   * 指定可选的“主机名”。主机名限制控制器的路由。
   */
  host?: string | RegExp | Array<string | RegExp>;
}

/**
 * @description Controller 装饰器可以接收一个参数，用于指定可选的“路由路径前缀”。前缀预挂载到每个控制器请求路径上。
 */
function Controller(): ClassDecorator; // 传递空字符串
function Controller(prefix: string): ClassDecorator; // 传递路径前缀
function Controller(options: ControllerOptions): ClassDecorator; // 传递对象
function Controller(
  prefixOrOptions?: string | ControllerOptions
): ClassDecorator {
  let baseOptions: ControllerOptions = {};
  switch (typeof prefixOrOptions) {
    case "string":
      baseOptions.path = prefixOrOptions;
      break;
    case "object":
      baseOptions = prefixOrOptions;
      break;
    default:
      baseOptions.path = "";
      break;
  }
  // 返回一个装饰器函数来处理类
  return (target: Function) => {
    // 给控制器类添加 path 路径前缀的元数据
    Reflect.defineMetadata(PREFIX_METADATA, baseOptions.path, target);
  };
}

export { Controller };
