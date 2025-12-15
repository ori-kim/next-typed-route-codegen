import type { JSX } from "react";

/**
 * Route metadata
 * Can be extended externally via declare module
 *
 * @example
 * declare module "next-typed-codegen-route" {
 *   interface RouteMeta {
 *     globalLayout?: GlobalLayoutMeta;
 *   }
 * }
 */
// biome-ignore lint/suspicious/noEmptyInterface: Extensible via declare module
export interface RouteMeta {}

/**
 * Convert all object values to string
 * Used for params/searchParams types when validator is not provided
 */
export type StringifyValues<T> = {
  [K in keyof T]: string;
};

/**
 * SearchParams validator type
 */
export type SearchParamsValidator<TSearchParams> = (
  searchParams: Record<string, string | string[] | undefined>,
) => Promise<TSearchParams> | TSearchParams;

/**
 * Params validator type
 */
export type ParamsValidator<TParams> = (
  params: Record<string, string>,
) => Promise<TParams> | TParams;

/**
 * Static route validator (searchParams only)
 */
export interface StaticRouteValidator<TSearchParams> {
  searchParams: SearchParamsValidator<TSearchParams>;
}

/**
 * Dynamic route validator (params required, searchParams optional)
 */
export interface DynamicRouteValidator<TParams, TSearchParams = never> {
  params: ParamsValidator<TParams>;
  searchParams?: TSearchParams extends never
    ? never
    : SearchParamsValidator<TSearchParams>;
}

/**
 * Server component type (async)
 */
export type ServerComponent<TProps> = (props: TProps) => Promise<JSX.Element>;

/**
 * Client component type
 */
export type ClientComponent<TProps> = (props: TProps) => JSX.Element;

// ============================================
// Static Route Options
// ============================================

/**
 * Static route with validator (searchParams type transformation)
 */
export interface StaticRouteOptionsWithValidator<TSearchParams> {
  component:
    | ServerComponent<{ searchParams: Promise<TSearchParams> }>
    | ClientComponent<{ searchParams: Promise<TSearchParams> }>;
  validator: StaticRouteValidator<TSearchParams>;
  meta?: RouteMeta;
}

/**
 * Static route without validator
 */
export interface StaticRouteOptions {
  component: ServerComponent<object> | ClientComponent<object>;
  validator?: never;
  meta?: RouteMeta;
}

// ============================================
// Dynamic Route Options
// ============================================

/**
 * Dynamic route with validator (params type transformation)
 */
export interface DynamicRouteOptionsWithValidator<
  TParams,
  TSearchParams = never,
> {
  component:
    | ServerComponent<{
        params: Promise<TParams>;
        searchParams?: TSearchParams extends never
          ? never
          : Promise<TSearchParams>;
      }>
    | ClientComponent<{
        params: Promise<TParams>;
        searchParams?: TSearchParams extends never
          ? never
          : Promise<TSearchParams>;
      }>;
  validator: DynamicRouteValidator<TParams, TSearchParams>;
  meta?: RouteMeta;
}

/**
 * Dynamic route without validator (all values are strings)
 */
export interface DynamicRouteOptions<TParams> {
  component:
    | ServerComponent<{ params: Promise<StringifyValues<TParams>> }>
    | ClientComponent<{ params: Promise<StringifyValues<TParams>> }>;
  validator?: never;
  meta?: RouteMeta;
}

/**
 * Metadata type attached to route components
 */
export interface RouteComponentMeta {
  _routeMeta?: RouteMeta;
  _routeValidator?:
    | StaticRouteValidator<unknown>
    | DynamicRouteValidator<unknown, unknown>;
}
