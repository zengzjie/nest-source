export type CustomDecorator<TKey = string> = ClassDecorator & MethodDecorator & {
    KEY: TKey;
}

export const SetMetadata = <K = string, V = any>(metadataKey: K, metadataValue: V): CustomDecorator<K> => {
    const decoratorFactory = (target: Object | Function, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        if (descriptor) {
            Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
        }
        Reflect.defineMetadata(metadataKey, metadataValue, target);
    };
    decoratorFactory.KEY = metadataKey;
    return decoratorFactory;
}