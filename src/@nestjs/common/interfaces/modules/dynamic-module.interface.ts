import { Type } from "../type.interface";
import { ModuleMetadata } from "./module-metadata.interface";
/**
 * 定义动态模块的接口.
 */
export interface DynamicModule extends ModuleMetadata {
  /**
   * 模块参考
   */
  module: Type<any>;
  /**
   * 当“true”时，使模块具有全局作用域.
   *
   * 一旦导入到任何模块中，就会看到全局范围的模块在所有模块中。此后，希望注入服务的模块导出不需要从全局模块导入提供程序模块.
   *
   * @default false
   */
  global?: boolean;
}
