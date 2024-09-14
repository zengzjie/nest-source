import 'reflect-metadata';
import { CustomDecorator, SetMetadata, Type } from '../common';
import { uid } from '@nestjs/common/utils/uid.util';
import { Global } from '@nestjs/common';

export type CreateDecoratorOptions<TParam = any, TTransformed = TParam> = {
    /**
     * 元数据的密钥
     * @default uid(21)
     */
    key?: string;
    /**
     * 应用于元数据值的转换函数
     * @param value 
     * @returns 
     */
    transform?: (value: TParam) => TTransformed;
};

type CreateDecoratorWithTransformOptions<TParam, TTransformed = TParam> = CreateDecoratorOptions<TParam, TTransformed> & Required<Pick<CreateDecoratorOptions<TParam, TTransformed>, 'transform'>>;

export type ReflectableDecorator<TParam, TTransformed = TParam> = ((opts?: TParam) => CustomDecorator) & {
    KEY: string;
};

@Global()
export class Reflector {
    static createDecorator<TParam>(options?: CreateDecoratorOptions<TParam>): ReflectableDecorator<TParam>
    static createDecorator<TParam, TTransformed>(options: CreateDecoratorWithTransformOptions<TParam, TTransformed>): ReflectableDecorator<TParam, TTransformed>
    static createDecorator<TParam, TTransformed>(options: CreateDecoratorOptions<TParam> | CreateDecoratorWithTransformOptions<TParam, TTransformed> = {}) {
        const metadataKey = options.key ?? uid(21);
        const decoratorFn = (metadataValue) => (target: Object | Function, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
            const value = options.transform ? options.transform(metadataValue) : metadataValue;
            SetMetadata(metadataKey, value ?? {})(target, propertyKey, descriptor);
        }

        decoratorFn.KEY = metadataKey;

        return decoratorFn;
    }
    /**
     * @example `const roles = this.reflector.get(Roles, context.getHandle())`
     * @param decorator 通过`Reflector.createDecorator`创建的可反射装饰器
     * @param target 从中检索元数据的上下文（装饰对象）
     */
    get<T extends ReflectableDecorator<any>>(decorator: T, target: Type<any> | Function): T extends ReflectableDecorator<any, infer R> ? R : unknown;
    /**
     * @example `const roles = this.reflector.get("roles", context.getHandle())`
     * @param metadataKey 要检索的元数据的查找键
     * @param target 从中检索元数据的上下文（装饰对象）
     */
    get<TResult = any, TKey = any>(metadataKey: TKey, target: Type<any> | Function): TResult;
    get(metadataKeyOrDecorator, target) {
        const metadataKey = metadataKeyOrDecorator.KEY ?? metadataKeyOrDecorator;
        return Reflect.getMetadata(metadataKey, target);
    }
}