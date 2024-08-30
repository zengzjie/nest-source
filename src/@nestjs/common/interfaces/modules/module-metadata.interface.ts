import { Abstract } from "../abstract.interface";
import { Type } from "../type.interface";
import { DynamicModule } from "./dynamic-module.interface";
import { ForwardReference } from "./forward-reference.interface";
import { Provider } from "./provider.interface";
/**
 * 定义描述模块的属性对象的接口.
 */
export interface ModuleMetadata {
  /**
   * 导出提供程序的导入模块的可选列表此模块中需要的提供程序.
   */
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  /**
   * 此模块中定义的控制器的可选列表，必须实例化.
   */
  controllers?: Type<any>[];
  /**
   * 将由Nest注入器实例化的提供程序的可选列表，并且可以至少在该模块之间共享.
   */
  providers?: Provider[];
  /**
   * 此模块提供的程序子集的可选列表，并且应该在导入该模块的其他模块中可用。
   */
  exports?: Array<
    | DynamicModule
    | Promise<DynamicModule>
    | string
    | symbol
    | Provider
    | ForwardReference
    | Abstract<any>
    | Function
  >;
}
