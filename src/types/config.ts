/**
 * Scanned route information (used by codegen)
 */
export interface ScannedRoute {
  /** Absolute file path */
  filePath: string;
  /** Route path (e.g., /test/[id]) */
  routePath: string;
  /** Dynamic parameter names (e.g., ["id"]) */
  params: string[];
  /** Whether this is a static route */
  isStatic: boolean;
}

/**
 * Codegen configuration
 */
export interface RouteCodegenConfig {
  /**
   * Path exclusion filter
   * Returns true to exclude the path from scanning
   *
   * @example
   * excludePath: (path) => path.includes("/@")
   */
  excludePath?: (path: string) => boolean;

  /**
   * Route sorting function
   * @example
   * sortRoutes: (a, b) => a.routePath.localeCompare(b.routePath)
   */
  sortRoutes?: (a: ScannedRoute, b: ScannedRoute) => number;

  /**
   * Output directory for generated files
   * Default: ".generated/next-typed-codegen-route"
   *
   * @example
   * outputDir: "src/generated/routes"
   */
  outputDir?: string;

  /**
   * App directory path to scan
   * Default: "src/app"
   */
  appDir?: string;
}

/**
 * Route codegen config helper
 */
export function createRouteConfig(config: RouteCodegenConfig): RouteCodegenConfig {
  return config;
}
