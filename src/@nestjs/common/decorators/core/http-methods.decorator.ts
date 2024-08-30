import "reflect-metadata";
import {
  HTTP_CODE_METADATA,
  PATH_METADATA,
  METHOD_METADATA,
  REDIRECT_URL_METADATA,
  REDIRECT_STATUS_CODE_METADATA,
  HEADER_METADATA,
} from "../../constants";

export function Get(path: string = ""): MethodDecorator {
  /**
   * target: 类原型 XxxController.prototype
   * propertyKey: 方法名
   * descriptor: 属性描述符
   */
  return (
    target: any,
    prototypeKey: string | symbol,
    decorator: PropertyDescriptor
  ) => {
    // 给 decorator.value 添加元数据 path
    Reflect.defineMetadata(PATH_METADATA, path, decorator.value);
    // 给 decorator.value 添加元数据 method
    Reflect.defineMetadata(METHOD_METADATA, "GET", decorator.value);
  };
}

export function Post(path: string = ""): MethodDecorator {
  return (
    target: any,
    prototypeKey: string | symbol,
    decorator: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(PATH_METADATA, path, decorator.value);
    Reflect.defineMetadata(METHOD_METADATA, "POST", decorator.value);
  };
}

export function HttpCode(httpCode: number): MethodDecorator {
  return (
    target: any,
    prototypeKey: string | symbol,
    decorator: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(HTTP_CODE_METADATA, httpCode, decorator.value);
  };
}

export function Redirect(
  redirectUrl: string,
  redirectStatusCode: number = 302
): MethodDecorator {
  return (
    target: any,
    prototypeKey: string | symbol,
    decorator: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(REDIRECT_URL_METADATA, redirectUrl, decorator.value);
    Reflect.defineMetadata(
      REDIRECT_STATUS_CODE_METADATA,
      redirectStatusCode,
      decorator.value
    );
  };
}

export function Header(name: string, value: string): MethodDecorator {
  return (
    target: any,
    prototypeKey: string | symbol,
    decorator: PropertyDescriptor
  ) => {
    const existingHeadersMap =
      Reflect.getMetadata(HEADER_METADATA, decorator.value) || [];
    existingHeadersMap.push({
      name,
      value,
    });

    Reflect.defineMetadata(
      HEADER_METADATA,
      existingHeadersMap,
      decorator.value
    );
  };
}
