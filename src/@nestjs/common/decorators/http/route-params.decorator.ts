import { CustomParamFactory } from "@nestjs/common/interfaces";

export type ParamData = object | string | number;
export interface RouteParamMetadata {
  index: number;
  factory: CustomParamFactory;
  data?: ParamData;
}
