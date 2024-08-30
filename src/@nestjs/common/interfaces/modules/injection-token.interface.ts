import { Abstract } from "../abstract.interface";
import { Type } from "../type.interface";
/**
 * 定义注入令牌的接口.
 */
export type InjectionToken<T = any> =
  | string
  | symbol
  | Type<T>
  | Abstract<T>
  | Function;
