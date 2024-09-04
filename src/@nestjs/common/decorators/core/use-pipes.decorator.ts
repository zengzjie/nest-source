import { PIPES_METADATA } from "@nestjs/common/constants";
import { PipeTransform } from "../../interfaces";

export const UsePipes = (
  ...pipes: (PipeTransform | Function)[]
): ClassDecorator & MethodDecorator => {
  return (
    target: Function,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) => {
    if (descriptor) {
        Reflect.defineMetadata(PIPES_METADATA, pipes, descriptor.value);
    }
    Reflect.defineMetadata(PIPES_METADATA, pipes, target);
  };
};
