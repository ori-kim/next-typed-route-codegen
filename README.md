# next-typed-codegen-route

Type-safe route codegen for Next.js App Router. Scan your `app` directory and generate typed route paths with full TypeScript inference.

## Features

- **Type-safe path builder** - `path("/user/[id]", { id: "123" })` with full TypeScript inference
- **Zero runtime overhead** - All types are generated at build time
- **Flexible filtering** - Exclude dynamic routes, parallel routes, or specific patterns
- **Simple API** - Just scan and generate

## Installation

```bash
npm install next-typed-codegen-route
# or
pnpm add next-typed-codegen-route
# or
yarn add next-typed-codegen-route
```

## Quick Start

### 1. Generate route types

```bash
npx next-typed-codegen-route generate
```

Or add to your build script:

```json
{
  "scripts": {
    "prebuild": "next-typed-codegen-route generate",
    "dev": "next-typed-codegen-route generate && next dev"
  }
}
```

### 2. Use generated types

```tsx
import { path } from "@/.generated/routes";

// Static route - no params needed
const homeUrl = path("/");
// => "/"

// Dynamic route - params are required and typed
const userUrl = path("/user/[id]", { id: "123" });
// => "/user/123"

// Multiple params - all must be provided
const postUrl = path("/user/[userId]/post/[postId]", {
  userId: "123",
  postId: "456",
});
// => "/user/123/post/456"

// TypeScript error if params are missing!
path("/user/[id]"); // ❌ Error: Expected 2 arguments
path("/user/[id]", {}); // ❌ Error: Property 'id' is missing
```

### 3. Runtime utilities

```tsx
import { matchDynamicRoute, extractParams } from "@/.generated/routes";

// Find matching pattern for a URL
const pattern = matchDynamicRoute("/user/123/post/456");
// => "/user/[userId]/post/[postId]"

// Extract params from URL
const params = extractParams("/user/123/post/456", "/user/[userId]/post/[postId]");
// => { userId: "123", postId: "456" }
```

## Configuration

Create `route-codegen.config.ts` in your project root:

```ts
import { defineConfig } from "next-typed-codegen-route";

export default defineConfig({
  // App directory to scan (default: "src/app")
  appDir: "src/app",

  // Output directory for generated files (default: ".generated/routes")
  outputDir: ".generated/routes",

  // Exclude specific path segments
  shouldExclude: (pathSegment) => {
    // Exclude dynamic [id], parallel @modal, group (auth) routes
    return /^\[|^@|^\(/.test(pathSegment);
  },

  // Sort routes
  sortChildren: (a, b) => a.href.localeCompare(b.href),
});
```

Or use CLI options:

```bash
npx next-typed-codegen-route --app-dir app --output src/generated/routes
```

## Generated Files

```
.generated/routes/
├── index.ts    # Re-exports everything
├── types.ts    # Route type definitions
└── utils.ts    # path(), matchDynamicRoute(), extractParams()
```

### Generated Types

```ts
// types.ts
export type StaticRouteHref =
  | "/"
  | "/about"
  | "/contact";

export type DynamicRouteHref =
  | "/user/[id]"
  | "/user/[userId]/post/[postId]";

export type RouteHref = StaticRouteHref | DynamicRouteHref;

export interface RouteParamsMap {
  "/user/[id]": { id: string };
  "/user/[userId]/post/[postId]": { userId: string; postId: string };
}
```

## CLI Commands

```bash
# Generate route types (default)
npx next-typed-codegen-route generate

# Initialize config file
npx next-typed-codegen-route init

# Custom options
npx next-typed-codegen-route --app-dir app --output src/generated/routes

# Help
npx next-typed-codegen-route help
```

## TypeScript Configuration

Add the generated directory to your tsconfig paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/.generated/*": ["./.generated/*"]
    }
  }
}
```

## Extending Route Meta

You can extend the `RouteMeta` interface for your own metadata:

```ts
// types/route-meta.d.ts
declare module "next-typed-codegen-route" {
  interface RouteMeta {
    title?: string;
    description?: string;
    icon?: React.ComponentType;
  }
}
```

Then use with `createRoute`:

```tsx
import { createRoute } from "next-typed-codegen-route";

export default createRoute({
  component: MyPage,
  meta: {
    title: "My Page",
    description: "A great page",
  },
});
```

## License

MIT
