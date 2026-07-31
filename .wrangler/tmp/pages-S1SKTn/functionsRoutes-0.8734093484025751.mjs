import { onRequest as __api_auth___path___ts_onRequest } from "C:\\Users\\scarl\\noovoleum\\noov-traceability-prototype-2\\functions\\api\\auth\\[[path]].ts"

export const routes = [
    {
      routePath: "/api/auth/:path*",
      mountPath: "/api/auth",
      method: "",
      middlewares: [],
      modules: [__api_auth___path___ts_onRequest],
    },
  ]