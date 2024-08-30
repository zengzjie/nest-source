import { Type } from "../type.interface";
import { ParamType } from "./paramtype.interface";

export type Transform<T = any> = (value: T, metadata: ArgumentMetadata) => any;
/**
 * 描述管道实现的“transform()”方法元数据参数的接口
 */
export interface ArgumentMetadata {
  /**
   * 指示参数是正文、查询、参数还是自定义参数
   */
  readonly type: ParamType;
  /**
   * 基于类型的参数的基础基类型（例如“String”）
   * 路由处理程序中的定义。
   */
  readonly metatype?: Type<any> | undefined;
  /**
   * 作为参数传递给装饰器的字符串。
   * 示例：`@Body（'userId'）`将产生`userId`
   */
  readonly data?: string | undefined;
}

/**
 * 管道实现的接口
 *
 */
export interface PipeTransform<T = any, R = any> {
  /**
   * 方法来实现自定义管道。使用两个参数调用
   *
   * @param value 由路由处理程序方法接收之前的参数
   * @param metadata 包含有关值的元数据
   */
  transform(value: T, metadata: ArgumentMetadata): R;
}
