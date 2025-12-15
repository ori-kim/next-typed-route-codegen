import * as fs from "node:fs";
import * as path from "node:path";
import type { RouteCodegenConfig, ScannedRoute } from "../types/config";
import { scanRoutes, routePathToRegexString } from "./scanner";
import { typesTemplate, routesTemplate } from "./templates";

/**
 * Execute code generation
 * Generates types.ts and routes.ts based on scanned routes
 * Note: Static files (route-meta.ts, create-route.ts, utils.ts, index.ts) should be created by `init` command
 */
export async function generate(config: RouteCodegenConfig = {}): Promise<void> {
  const {
    appDir = "src/app",
    outputDir = ".generated/next-typed-codegen-route",
    excludePath,
    sortRoutes,
  } = config;

  // 1. Scan routes
  const routes = scanRoutes(appDir, { excludePath });

  // 2. Apply sorting
  if (sortRoutes) {
    routes.sort(sortRoutes);
  }

  // 3. Extract type information
  const staticRoutes = routes.filter((r) => r.isStatic);
  const dynamicRoutes = routes.filter((r) => !r.isStatic);

  // 4. Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // 5. Generate files (types.ts and routes.ts only)
  const typesContent = generateTypesFile(staticRoutes, dynamicRoutes);
  const routesContent = generateRoutesFile(staticRoutes, dynamicRoutes, appDir);

  fs.writeFileSync(path.join(outputDir, "types.ts"), typesContent);
  fs.writeFileSync(path.join(outputDir, "routes.ts"), routesContent);

  console.log(`✅ Generated route files in ${outputDir}`);
  console.log(`   - ${routes.length} routes found`);
  console.log(`   - ${staticRoutes.length} static, ${dynamicRoutes.length} dynamic`);
}

/**
 * Generate types.ts content
 */
function generateTypesFile(
  staticRoutes: { routePath: string }[],
  dynamicRoutes: { routePath: string; params: string[] }[]
): string {
  const staticHrefUnion = staticRoutes.map((r) => `  | "${r.routePath}"`).join("\n");
  const dynamicHrefUnion = dynamicRoutes
    .map((r) => `  | "${r.routePath}"`)
    .join("\n");

  const paramsMap = dynamicRoutes
    .map((r) => {
      const params = r.params.map((k) => `    "${k}": string;`).join("\n");
      return `  "${r.routePath}": {\n${params}\n  };`;
    })
    .join("\n");

  return typesTemplate({ staticHrefUnion, dynamicHrefUnion, paramsMap });
}

/**
 * Generate routes.ts content
 */
function generateRoutesFile(
  staticRoutes: ScannedRoute[],
  dynamicRoutes: ScannedRoute[],
  appDir: string
): string {
  const dynamicPatterns = dynamicRoutes
    .map((r) => {
      const regexStr = routePathToRegexString(r.routePath);
      return `  { pattern: /${regexStr}/, href: "${r.routePath}" as const }`;
    })
    .join(",\n");

  // Convert filePath to import path (e.g., src/app/user/[id]/page.tsx -> @/app/user/[id]/page)
  const toImportPath = (filePath: string): string => {
    // Remove file extension
    const withoutExt = filePath.replace(/\.(tsx?|jsx?)$/, "");
    // Convert to @/ alias (assuming src/app -> @/app)
    if (withoutExt.startsWith("src/")) {
      return "@/" + withoutExt.slice(4);
    }
    // Fallback: use relative path with @/
    return "@/" + withoutExt;
  };

  return routesTemplate({
    dynamicPatterns,
    staticRoutes: staticRoutes.map((r) => ({
      routePath: r.routePath,
      importPath: toImportPath(r.filePath),
      params: r.params,
      isStatic: r.isStatic,
    })),
    dynamicRoutes: dynamicRoutes.map((r) => ({
      routePath: r.routePath,
      importPath: toImportPath(r.filePath),
      params: r.params,
      isStatic: r.isStatic,
    })),
  });
}
