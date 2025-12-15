// Route meta types
export type {
  RouteMeta,
  StringifyValues,
  SearchParamsValidator,
  ParamsValidator,
  StaticRouteValidator,
  DynamicRouteValidator,
  ServerComponent,
  ClientComponent,
  StaticRouteOptionsWithValidator,
  StaticRouteOptions,
  DynamicRouteOptionsWithValidator,
  DynamicRouteOptions,
  RouteComponentMeta,
} from "./route-meta";

// Config types
export type { RouteCodegenConfig, ScannedRoute } from "./config";
export { createRouteConfig } from "./config";
