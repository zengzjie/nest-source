import { PARAMETER_CONSTANT } from "@nestjs/common/constants";
import { CustomParamFactory, PipeTransform } from "../features";

export type ParametersMetadata = {
  index: number;
  factoryName: PARAMETER_CONSTANT;
  // extraParams 包含了 Query 装饰器的 queryKey，Headers 装饰器的 headerKey，Param 装饰器的 paramKey，Body 装饰器的 bodyKey
  extraParams?: {
    queryKey?: string;
    headerKey?: string;
    paramKey?: string;
    bodyKey?: string;
    resConfiguration?: ResConfiguration;
  };
  pipes: PipeTransform[];
};

export interface ResConfiguration {
  passthrough?: boolean;
}
