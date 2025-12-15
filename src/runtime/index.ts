// Route creation functions
export { createRoute, createDynamicRoute } from "./create-route";
export type { RouteComponent } from "./create-route";

// Path builder utilities
export {
  buildPath,
  extractParamKeys,
  isDynamicRoute,
  routeToRegex,
  matchRoute,
} from "./path-builder";
