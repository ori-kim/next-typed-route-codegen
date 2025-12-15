// Main entry point - exports everything

// Types
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
  RouteCodegenConfig,
  ScannedRoute,
} from "./types";

export { createRouteConfig } from "./types";

// Runtime functions
export {
  createRoute,
  createDynamicRoute,
  buildPath,
  extractParamKeys,
  isDynamicRoute,
  routeToRegex,
  matchRoute,
} from "./runtime";

export type { RouteComponent, RouteConfig } from "./runtime";
