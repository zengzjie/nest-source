import {
  PARAMETERS_METADATA,
  PARAMETER_CONSTANT,
  ROUTE_ARGS_METADATA,
} from "../../constants";
import { ParamData } from "..";
import { CustomParamFactory, PipeTransform, Type } from "../../interfaces";
import { ParametersMetadata, ResConfiguration } from "../../interfaces/params";
import { assignCustomParameterMetadata } from "../../utils/assign-custom-metadata.util";
import { isNil, isString } from "../../utils/shared.util";
import { uid } from "@nestjs/common/utils/uid.util";

type ParamDecoratorEnhancer = ParameterDecorator;

/**
 * @description: 创建参数装饰器工厂
 * @param {PARAMETER_CONSTANT} factoryName 参数工厂命名
 * @return {*}
 */
export function createParamDecoratorFactory(
  factoryName: ParametersMetadata["factoryName"]
) {
  return (extraParams?: ParametersMetadata["extraParams"], pipes = []) => {
    // target 控制器类的原型, propertyKey 方法名, parameterIndex 参数索引（先走1再走0）
    return (target: any, propertyKey: string, parameterIndex: number) => {
      // 给控制器类的原型的 propertyKey 也就是（例子：UserController上的 handleRequest）方法属性上添加元数据
      // 属性名是 PARAMETERS_METADATA，值是一个数组，数组里面是对象，对象有两个属性 index 和 factoryName， 表示哪个位置使用了哪个工厂装饰器
      const existingParamIndexes: ParametersMetadata[] =
        Reflect.getMetadata(PARAMETERS_METADATA, target, propertyKey) || [];
      // 保证了参数的顺序，因为有可能两个装饰器中间夹着的是没有装饰器的参数
      // [ { index: 1, factoryName: 'Request' }, undefined, { index: 0, factoryName: 'Req' }]
      existingParamIndexes[parameterIndex] = {
        index: parameterIndex,
        factoryName,
        extraParams,
        pipes,
      };

      Reflect.defineMetadata(
        PARAMETERS_METADATA,
        existingParamIndexes,
        target,
        propertyKey
      );
    };
  };
}

/**
 * @description: 创建自定义参数装饰器
 * @param {CustomParamFactory<FactoryData, FactoryInput, FactoryOutput>} factory 自定义参数工厂
 * @param {ParamDecoratorEnhancer[]} enhancers 装饰器增强器
 * @return {*}
 */
export function createParamDecorator<
  FactoryData = any,
  FactoryInput = any,
  FactoryOutput = any
>(
  factory: CustomParamFactory<FactoryData, FactoryInput, FactoryOutput>,
  enhancers?: ParamDecoratorEnhancer[]
): (
  ...dataOrPipes: (Type<PipeTransform> | PipeTransform | FactoryData)[]
) => ParameterDecorator {
  // dataOrPipes 是一个数组，第一个是 data，后面的是 pipes
  return (data, ...pipes) => {
    const paramtype = uid(21);
    return (
      target: any,
      propertyKey: string | symbol,
      parameterIndex: number
    ) => {
      // 获取参数的元数据
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target, propertyKey) || {};
      // 判断 data 是否有值
      const hasParamData = !isNil(data);
      // 如果有值则直接赋值，没有则为 undefined
      const paramData = hasParamData ? (data as ParamData) : undefined;

      // 将参数的元数据添加到控制器类的原型的 propertyKey 方法上，
      // assignCustomParameterMetadata 用来将自定义参数元数据整合到一起
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignCustomParameterMetadata(
          args,
          paramtype,
          parameterIndex,
          factory,
          paramData
        ),
        target,
        propertyKey
      );
      // 在参数装饰器定义之后添加额外的逻辑或操作
      enhancers?.forEach((enhancer) => {
        enhancer(target, propertyKey, parameterIndex);
      });
    };
  };
}

const assignMetadata = <TParamtype = any, TArgs = any>(args: TArgs, paramtype: TParamtype, index: number, data: ParamData, ...pipes: (Type<PipeTransform> | PipeTransform)[]): TArgs & {
  [x: string]: {
    index: number;
    data: ParamData;
    pipes: (PipeTransform<any, any> | Type<PipeTransform<any, any>>)[];
  }
} => {
  return {
    ...args,
    [`${paramtype}:${index}`]: {
      index,
      data,
      pipes,
    },
  };
};

const createPipesRouteParamDecorator =
  (
    paramtype: string
  ): ((
    data: string | (Type<PipeTransform> | PipeTransform), ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ) => ParameterDecorator) =>
  (data, ...pipes) =>
  (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const args =
      Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        target,
        propertyKey
      ) ?? {};
    const hasParamData = isNil(data) || isString(data);
    const paramData = hasParamData ? data : void 0;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];
    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      assignMetadata(args, paramtype, parameterIndex, paramData, ...paramPipes),
      target,
      propertyKey
    );
  };

export const Request = createParamDecoratorFactory(PARAMETER_CONSTANT.REQUEST);
export const Req = createParamDecoratorFactory(PARAMETER_CONSTANT.REQ);
export const Next = createParamDecoratorFactory(PARAMETER_CONSTANT.NEXT);
export const Res = (resConfiguration?: ResConfiguration) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.RES)({
    resConfiguration,
  });
export const Response = (resConfiguration?: ResConfiguration) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.RESPONSE)({
    resConfiguration,
  });
export const Ip = createParamDecoratorFactory(PARAMETER_CONSTANT.IP);
export const Session = createParamDecoratorFactory(PARAMETER_CONSTANT.SESSION);
export const Query = (queryKey?: string, ...pipes) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.QUERY)({ queryKey }, pipes);
export const Headers = (headerKey?: string) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.HEADERS)({ headerKey });
export const Param = (paramKey?: string, ...pipes) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.PARAM)({ paramKey }, pipes);
export const Body = (bodyKey?: string, ...pipes) =>
  createParamDecoratorFactory(PARAMETER_CONSTANT.BODY)({ bodyKey }, pipes);

export function UploadedFile(): ParameterDecorator;
export function UploadedFile(...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
export function UploadedFile(fileKey?: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
export function UploadedFile(fileKey?: string | (Type<PipeTransform> | PipeTransform), ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator {
  return createPipesRouteParamDecorator(PARAMETER_CONSTANT.FILE)(fileKey, ...pipes);
}

export function UploadedFiles(): ParameterDecorator;
export function UploadedFiles(...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
export function UploadedFiles(...pipes: (Type<PipeTransform> | PipeTransform)[]) {
  return createPipesRouteParamDecorator(PARAMETER_CONSTANT.FILES)(undefined, ...pipes);
}
