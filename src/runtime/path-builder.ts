/**
 * Build actual path by substituting dynamic route parameters
 *
 * @example
 * buildPath("/service/karavan/cluster/[cluster-name]/topic/[topic-name]", {
 *   "cluster-name": "production",
 *   "topic-name": "events",
 * });
 * // => "/service/karavan/cluster/production/topic/events"
 */
export function buildPath(
  route: string,
  params?: Record<string, string>
): string {
  if (!params) return route;

  return route.replace(/\[([^\]]+)\]/g, (_, key) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing param: ${key} for route: ${route}`);
    }
    return encodeURIComponent(value);
  });
}

/**
 * Extract dynamic parameter keys from path
 *
 * @example
 * extractParamKeys("/service/karavan/cluster/[cluster-name]/topic/[topic-name]")
 * // => ["cluster-name", "topic-name"]
 */
export function extractParamKeys(route: string): string[] {
  const matches = route.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Check if path is a dynamic route
 *
 * @example
 * isDynamicRoute("/service/karavan/cluster/[cluster-name]") // true
 * isDynamicRoute("/service/karavan/topic") // false
 */
export function isDynamicRoute(route: string): boolean {
  return /\[[^\]]+\]/.test(route);
}

/**
 * Convert dynamic route pattern to regex
 *
 * @example
 * routeToRegex("/service/karavan/cluster/[cluster-name]/topic/[topic-name]")
 * // => /^\/service\/karavan\/cluster\/([^/]+)\/topic\/([^/]+)$/
 */
export function routeToRegex(route: string): RegExp {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[([^\]]+)\\\]/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

/**
 * Match actual path against dynamic route pattern and extract parameters
 *
 * @example
 * matchRoute(
 *   "/service/karavan/cluster/prod/topic/events",
 *   "/service/karavan/cluster/[cluster-name]/topic/[topic-name]"
 * )
 * // => { "cluster-name": "prod", "topic-name": "events" }
 */
export function matchRoute(
  pathname: string,
  pattern: string
): Record<string, string> | null {
  const regex = routeToRegex(pattern);
  const match = pathname.match(regex);

  if (!match) return null;

  const keys = extractParamKeys(pattern);
  const result: Record<string, string> = {};

  keys.forEach((key, index) => {
    result[key] = decodeURIComponent(match[index + 1]);
  });

  return result;
}
