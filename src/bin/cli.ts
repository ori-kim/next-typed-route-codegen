#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "../codegen/generator";
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
  init        Create a default config file
  help        Show this help message

Options:
  --app-dir <path>      App directory to scan (default: src/app)
  --output <path>       Output directory (default: .generated/routes)

Examples:
  npx next-typed-codegen-route
  npx next-typed-codegen-route generate
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
  const configContent = `import { defineConfig } from "next-typed-codegen-route";

export default defineConfig({
  // 스캔할 app 디렉토리 경로
  appDir: "src/app",

  // 생성된 파일들의 출력 디렉토리
  outputDir: ".generated/routes",

  // 제외할 경로 패턴
  shouldExclude: (pathSegment) => {
    // 동적 라우팅 [id], 병렬 라우팅 @modal, 그룹 라우팅 (group)
    return /^\\[|^@|^\\(/.test(pathSegment);
  },

  // 자식 정렬 (href 기준 알파벳순)
  sortChildren: (a, b) => a.href.localeCompare(b.href),
});
`;

  const configPath = path.join(process.cwd(), "route-codegen.config.ts");

  if (fs.existsSync(configPath)) {
    console.log("⚠️ Config file already exists: route-codegen.config.ts");
    return;
  }

  fs.writeFileSync(configPath, configContent);
  console.log("✅ Created config file: route-codegen.config.ts");
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

  if (command === "generate" || !args[0]) {
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
