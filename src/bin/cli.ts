#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../codegen/generator";
import {
  routeMetaTemplate,
  createRouteTemplate,
  utilsStaticTemplate,
  indexInitTemplate,
  typesInitTemplate,
  routesInitTemplate,
} from "../codegen/templates";
import type { RouteCodegenConfig } from "../types/config";

const CONFIG_FILE_NAMES = [
  "route-codegen.config.ts",
  "route-codegen.config.js",
  "route-codegen.config.mjs",
];

async function loadConfig(): Promise<RouteCodegenConfig> {
  const cwd = process.cwd();

  for (const configFile of CONFIG_FILE_NAMES) {
    const configPath = path.join(cwd, configFile);
    if (fs.existsSync(configPath)) {
      try {
        const module = await import(configPath);
        return module.default || module.codegenConfig || module;
      } catch (error) {
        console.warn(`⚠️ Failed to load ${configFile}:`, error);
      }
    }
  }

  // Return default config
  return {};
}

function printHelp() {
  console.log(`
next-typed-codegen-route - Type-safe route codegen for Next.js App Router

Usage:
  npx next-typed-codegen-route [command] [options]

Commands:
  generate    Generate route types (default)
  watch       Watch for changes and regenerate
  init        Create a default config file
  help        Show this help message

Options:
  --app-dir <path>      App directory to scan (default: src/app)
  --output <path>       Output directory (default: .generated/routes)

Examples:
  npx next-typed-codegen-route
  npx next-typed-codegen-route generate
  npx next-typed-codegen-route watch
  npx next-typed-codegen-route --app-dir app --output src/generated/routes
`);
}

function printVersion() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = path.join(__dirname, "../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    console.log(`v${packageJson.version}`);
  } catch {
    console.log("v0.1.0");
  }
}

async function initConfig() {
  const cwd = process.cwd();
  const outputDir = ".generated/next-typed-codegen-route";
  const outputPath = path.join(cwd, outputDir);

  // Create output directory
  fs.mkdirSync(outputPath, { recursive: true });

  // Generate static files
  const files = [
    { name: "route-meta.ts", content: routeMetaTemplate() },
    { name: "create-route.ts", content: createRouteTemplate() },
    { name: "types.ts", content: typesInitTemplate() },
    { name: "routes.ts", content: routesInitTemplate() },
    { name: "utils.ts", content: utilsStaticTemplate() },
    { name: "index.ts", content: indexInitTemplate() },
  ];

  for (const file of files) {
    fs.writeFileSync(path.join(outputPath, file.name), file.content);
  }

  console.log(`✅ Initialized route files in ${outputDir}`);
  console.log("   Generated files:");
  for (const file of files) {
    console.log(`   - ${file.name}`);
  }

  // Create config file
  const configContent = `import { createRouteConfig } from "./${outputDir}";

export default createRouteConfig({
  // App directory path to scan
  appDir: "src/app",

  // Output directory for generated files
  outputDir: "${outputDir}",

  // Path exclusion filter
  excludePath: (path) => {
    // Exclude: parallel routes @modal, route groups (group)
    return /[@(]/.test(path);
  },

  // Route sorting (alphabetical by routePath)
  sortRoutes: (a, b) => a.routePath.localeCompare(b.routePath),
});
`;

  const configPath = path.join(cwd, "route-codegen.config.ts");

  if (fs.existsSync(configPath)) {
    console.log("\n⚠️ Config file already exists: route-codegen.config.ts");
  } else {
    fs.writeFileSync(configPath, configContent);
    console.log("\n✅ Created config file: route-codegen.config.ts");
  }

  console.log("\n📋 Next steps:");
  console.log("   1. Run `npx next-typed-codegen-route generate` to generate route types");
  console.log(`   2. Import from '${outputDir}' in your pages:`);
  console.log(`      import { createRoute, createDynamicRoute } from '${outputDir}';`);
}

async function watch(config: RouteCodegenConfig) {
  const appDir = config.appDir || "src/app";

  // Initial generation
  await generate(config);

  console.log(`👀 Watching for changes in ${appDir}...`);
  console.log("   Press Ctrl+C to stop\n");

  let timeout: NodeJS.Timeout | null = null;
  let isGenerating = false;

  fs.watch(appDir, { recursive: true }, (eventType, filename) => {
    // Only watch .ts and .tsx files
    if (!filename?.endsWith(".tsx") && !filename?.endsWith(".ts")) return;

    // Debounce to avoid multiple rapid regenerations
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      if (isGenerating) return;
      isGenerating = true;

      console.log(`🔄 Change detected: ${filename}`);
      try {
        await generate(config);
      } catch (error) {
        console.error("❌ Generation failed:", (error as Error).message);
      }
      isGenerating = false;
    }, 100);
  });
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const command = args[0] || "generate";

  if (command === "help" || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    printVersion();
    return;
  }

  if (command === "init") {
    await initConfig();
    return;
  }

  if (command === "generate" || command === "watch" || !args[0]) {
    // CLI option parsing
    const appDirIndex = args.indexOf("--app-dir");
    const outputIndex = args.indexOf("--output");

    const cliOptions: Partial<RouteCodegenConfig> = {};

    if (appDirIndex !== -1 && args[appDirIndex + 1]) {
      cliOptions.appDir = args[appDirIndex + 1];
    }

    if (outputIndex !== -1 && args[outputIndex + 1]) {
      cliOptions.outputDir = args[outputIndex + 1];
    }

    // Load config file and merge with CLI options
    const fileConfig = await loadConfig();
    const config = { ...fileConfig, ...cliOptions };

    if (command === "watch") {
      await watch(config);
      return;
    }

    console.log("🔍 Scanning routes...");
    await generate(config);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
