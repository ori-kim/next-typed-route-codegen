import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "runtime/index": "src/runtime/index.ts",
    "codegen/index": "src/codegen/index.ts",
    "bin/cli": "src/bin/cli.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react"],
});
