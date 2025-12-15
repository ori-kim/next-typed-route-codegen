import type {
  DynamicRouteOptions,
  DynamicRouteOptionsWithValidator,
  DynamicRouteValidator,
  RouteMeta,
  StaticRouteOptions,
  StaticRouteOptionsWithValidator,
  StaticRouteValidator,
  StringifyValues,
} from "../types/route-meta";

/**
 * Route config type (the options passed to createRoute/createDynamicRoute)
 */
export type RouteConfig =
  | StaticRouteOptions
  | StaticRouteOptionsWithValidator<unknown>
  | DynamicRouteOptions<unknown>
  | DynamicRouteOptionsWithValidator<unknown, unknown>;

/**
 * Route component type with attached config
 */
export type RouteComponent<P = object> = React.ComponentType<P> & {
  _routeConfig?: RouteConfig;
};

// ============================================
// createRoute - Static Routes
// ============================================

/**
 * Static route with validator
 */
export function createRoute<TSearchParams>(
  options: StaticRouteOptionsWithValidator<TSearchParams>,
): RouteComponent<{ searchParams: Promise<TSearchParams> }>;

/**
 * Static route without validator
 */
export function createRoute(options: StaticRouteOptions): RouteComponent;

/**
 * Create static route
 */
export function createRoute(
  options: StaticRouteOptionsWithValidator<unknown> | StaticRouteOptions,
  // biome-ignore lint/suspicious/noExplicitAny: Overload implementation signature
): RouteComponent<any> {
  const RouteComponent = options.component as RouteComponent;
  RouteComponent._routeConfig = options;
  return RouteComponent;
}

// ============================================
// createDynamicRoute - Dynamic Routes
// ============================================

/**
 * Dynamic route with validator (type transformation)
 */
export function createDynamicRoute<TParams, TSearchParams = never>(
  options: DynamicRouteOptionsWithValidator<TParams, TSearchParams>,
): RouteComponent<{
  params: Promise<TParams>;
  searchParams?: TSearchParams extends never ? never : Promise<TSearchParams>;
}>;

/**
 * Dynamic route without validator (all values are strings)
 */
export function createDynamicRoute<TParams>(
  options: DynamicRouteOptions<TParams>,
): RouteComponent<{ params: Promise<StringifyValues<TParams>> }>;

/**
 * Create dynamic route
 */
export function createDynamicRoute(
  options: DynamicRouteOptionsWithValidator<unknown, unknown> | DynamicRouteOptions<unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Overload implementation signature
): RouteComponent<any> {
  const RouteComponent = options.component as RouteComponent;
  RouteComponent._routeConfig = options;
  return RouteComponent;
}
