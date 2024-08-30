import { GLOBAL_MODULE_METADATA, Type } from "@nestjs/common";
import { Provider, ClassProvider } from "@nestjs/common";
import {
  MODULE_METADATA,
  ModuleMetadata,
  NAMESPACE_MODULE_METADATA,
} from "@nestjs/common";
import "reflect-metadata";

/**
 * @description: Module 装饰器用于定义一个模块，模块是一个具有一组控制器的类。
 * @param {ModuleMetadata} metadata 描述模块的属性
 * @return {*}
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    // 标识此类是一个模块类
    Reflect.defineMetadata(MODULE_METADATA.MODULE, true, target);
    // 给模块类添加元数据 AppModule，元数据的名字叫 controllers，值是 controllers 数组 -> [AppController]
    Reflect.defineMetadata(
      MODULE_METADATA.CONTROLLERS,
      metadata.controllers,
      target
    );

    defineNameSpaceModule(target, metadata.controllers);

    // 给模块类添加元数据 AppModule，元数据的名字叫 providers，值是 providers 数组 -> [CatsService, {provide: 'DogsService', useValue: new DogsService()}...]
    Reflect.defineMetadata(
      MODULE_METADATA.PROVIDERS,
      metadata.providers,
      target
    );
    const providers = metadata.providers
      .map((provider) =>
        provider instanceof Function
          ? provider
          : (provider as ClassProvider).useClass
      )
      .filter(Boolean);
    // 将 providers 中的 useClass 的类添加到 AppModule 的命名空间中
    defineNameSpaceModule(target, providers);

    // 给模块类添加元数据 AppModule，元数据的名字叫 imports，值是 imports 数组 -> [CommonModule]
    Reflect.defineMetadata(MODULE_METADATA.IMPORTS, metadata.imports, target);

    // 给模块类添加元数据 AppModule，元数据的名字叫 exports，值是 exports 数组 -> [CommonService]
    Reflect.defineMetadata(MODULE_METADATA.EXPORTS, metadata.exports, target);
  };
}

/**
 * @description: 定义命名空间模块
 * @param {*} clazz 对应的模块类
 * @param {Type} entities 对应的 controller 或者 providers 数组
 * @return {*}
 */
export function defineNameSpaceModule(clazz, entities: Type[] | Provider[]) {
  entities?.forEach((entity) => {
    Reflect.defineMetadata(NAMESPACE_MODULE_METADATA, clazz, entity);
  });
}

/**
 * @description: 全局模块装饰器
 * @return {*}
 */
export function Global() {
  return (target: Function) => {
    Reflect.defineMetadata(GLOBAL_MODULE_METADATA, true, target);
  };
}
