/**
 * @自定义参数工厂
 */
export type CustomParamFactory<TData = any, TInput = any, TOutput = any> = (
  data: TData,
  input: TInput
) => TOutput;
