import * as fs from "node:fs";
import * as path from "node:path";
import type { ScannedRoute } from "../types/config";

/**
 * Scan all page.tsx files from app directory
 */
export function scanRoutes(
  appDir: string,
  options: {
    excludePath?: (path: string) => boolean;
  } = {}
): ScannedRoute[] {
  const { excludePath } = options;
  const routes: ScannedRoute[] = [];

  function walk(dir: string, segments: string[] = []) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name.startsWith("_")) continue;

        // Check if should exclude (using full path)
        const currentPath = "/" + [...segments, entry.name].join("/");
        if (excludePath && excludePath(currentPath)) continue;

        walk(entryPath, [...segments, entry.name]);
      } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
        // Check if file uses createRoute or createDynamicRoute
        if (!usesRouteCreator(entryPath)) continue;

        const routePath = "/" + segments.join("/");

        // Extract dynamic params from path
        const params = extractParamKeys(routePath);
        const isStatic = params.length === 0;

        routes.push({
          filePath: entryPath,
          routePath,
          params,
          isStatic,
        });
      }
    }
  }

  walk(appDir);
  return routes;
}

/**
 * Check if file uses createRoute or createDynamicRoute
 */
function usesRouteCreator(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return /\b(createRoute|createDynamicRoute)\s*\(/.test(content);
}

/**
 * Extract dynamic parameter keys from path
 */
function extractParamKeys(routePath: string): string[] {
  const matches = routePath.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Convert route path to regex pattern string
 */
export function routePathToRegexString(routePath: string): string {
  return (
    "^" +
    routePath
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\//g, "\\/")
      .replace(/\\\[([^\]]+)\\\]/g, "([^/]+)") +
    "$"
  );
}
