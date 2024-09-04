export * from "./parameter.constant";

const MODULE_METADATA = {
  MODULE: "module",
  IMPORTS: "imports",
  PROVIDERS: "providers",
  CONTROLLERS: "controllers",
  EXPORTS: "exports",
};

const PREFIX_METADATA = "prefix";

const GLOBAL_MODULE_METADATA = "global";
const PATH_METADATA = "path";
const METHOD_METADATA = "method";
const PARAMTYPES_METADATA = "design:paramtypes";
const TYPE_METADATA = "design:type";
const SELF_DECLARED_DEPS_METADATA = "self:paramtypes";
const PROPERTY_DEPS_METADATA = "self:properties_metadata";
const HTTP_CODE_METADATA = "__httpCode__";
const REDIRECT_URL_METADATA = "__redirectUrl__";
const REDIRECT_STATUS_CODE_METADATA = "__redirectStatusCode__";
const HEADER_METADATA = "__header__";
const PARAMETERS_METADATA = "__parameters__";
const ROUTE_ARGS_METADATA = "__routeArguments__";
const CUSTOM_ROUTE_ARGS_METADATA = "__customRouteArgs__";
const INJECTABLE_WATERMARK = "__injectable__";
const NAMESPACE_MODULE_METADATA = "__namespace_module__";
const CATCH_WATERMARK = "__catch__";
const FILTER_CATCH_EXCEPTIONS = "__filterCatchExceptions__";
const EXCEPTION_FILTERS_METADATA = "__exceptionFilters__";
const INTERCEPTORS_METADATA = "__interceptors__";
const PIPES_METADATA = "__pipes__";
const GUARDS_METADATA = "__guards__";

export {
  MODULE_METADATA,
  PREFIX_METADATA,
  PATH_METADATA,
  METHOD_METADATA,
  PARAMTYPES_METADATA,
  HTTP_CODE_METADATA,
  REDIRECT_URL_METADATA,
  REDIRECT_STATUS_CODE_METADATA,
  HEADER_METADATA,
  PARAMETERS_METADATA,
  ROUTE_ARGS_METADATA,
  CUSTOM_ROUTE_ARGS_METADATA,
  INJECTABLE_WATERMARK,
  SELF_DECLARED_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  TYPE_METADATA,
  NAMESPACE_MODULE_METADATA,
  GLOBAL_MODULE_METADATA,
  CATCH_WATERMARK,
  FILTER_CATCH_EXCEPTIONS,
  EXCEPTION_FILTERS_METADATA,
  INTERCEPTORS_METADATA,
  PIPES_METADATA,
  GUARDS_METADATA
};
