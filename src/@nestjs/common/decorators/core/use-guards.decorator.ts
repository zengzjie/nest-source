import { GUARDS_METADATA } from "../../constants";
import { CanActivate } from "../../interfaces/features/can-activate.interface";

export const UseGuards = (...guards: (CanActivate | Function)[]): MethodDecorator & ClassDecorator => {
    return (target: Object | Function, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        if (descriptor) {
            Reflect.defineMetadata(GUARDS_METADATA, guards, descriptor.value);
        }
        Reflect.defineMetadata(GUARDS_METADATA, guards, target);
    }
};
