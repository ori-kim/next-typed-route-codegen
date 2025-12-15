// Route creation functions
export { createRoute, createDynamicRoute } from "./create-route";
export type { RouteComponent, RouteConfig } from "./create-route";

// Path builder utilities
export {
  buildPath,
  extractParamKeys,
  isDynamicRoute,
  routeToRegex,
  matchRoute,
} from "./path-builder";
