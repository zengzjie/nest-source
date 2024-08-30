import { EXCEPTION_FILTERS_METADATA } from "@nestjs/common/constants";
import { ExceptionFilter } from "../../interfaces";
import { extendArrayMetadata } from "../../utils/extend-metadata.util";

export const UseFilters = (
  ...filters: (ExceptionFilter | Function)[]
): MethodDecorator & ClassDecorator => {
  return (
    target: Function,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) => {
    if (descriptor) {
        extendArrayMetadata(EXCEPTION_FILTERS_METADATA, filters, descriptor.value);
    }
    extendArrayMetadata(EXCEPTION_FILTERS_METADATA, filters, target);
  };
};
