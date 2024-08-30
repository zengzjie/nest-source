import {
  PARAMTYPES_METADATA,
  PROPERTY_DEPS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  TYPE_METADATA,
} from "@nestjs/common/constants";
import { isUndefined } from "@nestjs/common/utils/shared.util";
import "reflect-metadata";

export function Inject<T = any>(
  token?: T
): PropertyDecorator & ParameterDecorator {
  return (
    target: Object,
    prototypeKey: string | symbol,
    parameterIndex?: number
  ) => {
    console.log(target, target.constructor, parameterIndex, prototypeKey);

    console.log(
      Reflect.getMetadata("design:paramtypes", target, prototypeKey),
      "design:paramtypes"
    );
    // 针对属性装饰器，获取属性的类型
    console.log(
      Reflect.getMetadata("design:type", target, prototypeKey),
      "design:type"
    );

    /*
    @Inject()
    private readonly service: Service
    如果是装饰属性的话 Reflect.getMetadata("design:type", target, prototypeKey); 得到的结果就是 Service
    */
    let type =
      token || Reflect.getMetadata(TYPE_METADATA, target, prototypeKey);

    // 如果没有传入 token 令牌或者没有获取到属性的类型，就去获取构造函数的参数类型
    if (!type) {
      type = Reflect.getMetadata(PARAMTYPES_METADATA, target, prototypeKey);
    }

    // parameterIndex 为 undefined 说明是装饰属性，否则是装饰参数
    if (!isUndefined(parameterIndex)) {
      let dependencies =
        Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) ?? [];

      dependencies = [...dependencies, { index: parameterIndex, param: type }];
      Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, dependencies, target);
      return;
    }

    // 如果是装饰属性的话，就直接把属性的类型和属性名放到 PROPERTY_DEPS_METADATA 元数据中
    let properties =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, target.constructor) ?? [];
    properties = [...properties, { key: prototypeKey, type }];
    Reflect.defineMetadata(
      PROPERTY_DEPS_METADATA,
      properties,
      target.constructor
    );
  };
}
