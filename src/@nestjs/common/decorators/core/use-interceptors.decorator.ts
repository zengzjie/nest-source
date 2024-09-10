import { INTERCEPTORS_METADATA } from "../../constants";
import { NestInterceptor } from "../../interfaces"

export const UseInterceptors = (...interceptors: (NestInterceptor | Function)[]): ClassDecorator & MethodDecorator => {
    return (target: Object | Function, property?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        const existingParamIndexes = Reflect.getMetadata(INTERCEPTORS_METADATA, descriptor ? descriptor.value : target) || [];
        if (descriptor) {
            Reflect.defineMetadata(INTERCEPTORS_METADATA, [...existingParamIndexes, ...interceptors], descriptor.value);
        }
        Reflect.defineMetadata(INTERCEPTORS_METADATA, [...existingParamIndexes, ...interceptors], target);
    }
}
