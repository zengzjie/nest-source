import { CustomParamFactory } from "../interfaces/features/custom-route-param-factory.interface";
import {
  ParamData,
  RouteParamMetadata,
} from "../decorators/http/route-params.decorator";
import { CUSTOM_ROUTE_ARGS_METADATA } from "../constants";

export type CustomParameterMetadataRecord = Record<string, RouteParamMetadata>;

/**
 * @description: 指定自定义参数元数据，用于自定义参数工厂
 * @return {*}
 */
export function assignCustomParameterMetadata(
  args: Record<string, RouteParamMetadata>,
  paramType: number | string,
  index: number,
  factory: CustomParamFactory,
  data?: ParamData
): CustomParameterMetadataRecord {
  return {
    ...args,
    [`${paramType}${CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
      index,
      factory,
      data,
    },
  };
}
