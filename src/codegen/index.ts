// Scanner
export { scanRoutes, routePathToRegexString } from "./scanner";

// Generator
export { generate } from "./generator";

// Templates - Init (static files, generated once)
export {
  routeMetaTemplate,
  createRouteTemplate,
  utilsStaticTemplate,
  indexInitTemplate,
  typesInitTemplate,
  routesInitTemplate,
  getHeaderComment,
} from "./templates";

// Templates - Generate (dynamic files, regenerated on route changes)
export { typesTemplate, routesTemplate } from "./templates";
