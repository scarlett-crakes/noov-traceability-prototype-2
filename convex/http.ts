// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: { env: Record<string, string | undefined> }

import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { betterAuth } from 'better-auth'
import { createAdapterFactory } from 'better-auth/adapters'
import { internal } from './_generated/api'
import type { GenericActionCtx } from 'convex/server'
import type { DataModel } from './_generated/dataModel'

type ActionCtx = GenericActionCtx<DataModel>

const TRUSTED_ORIGINS = [
  'http://localhost:5173',
  'https://noov-traceability-prototype-2.pages.dev',
  'https://traceability.ucollect.dev',
]

function modelToConvexTable(model: string): string {
  const map: Record<string, string> = {
    user: 'authUsers',
    session: 'authSessions',
    account: 'authAccounts',
    verification: 'authVerifications',
  }
  return map[model] ?? model
}

function cleanWhere(where: any[]): any[] {
  return (where ?? []).map((w: any) => ({
    field: String(w.field),
    value: w.value instanceof Date ? w.value.getTime() : (w.value ?? null),
    operator: w.operator ?? 'eq',
    connector: w.connector ?? 'AND',
  }))
}

// Convert Date objects → timestamps (Convex stores dates as numbers)
function serializeDates(data: any): any {
  if (data === null || data === undefined) return data
  if (data instanceof Date) return data.getTime()
  if (Array.isArray(data)) return data.map(serializeDates)
  if (typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, serializeDates(v)])
    )
  }
  return data
}

function createConvexAdapterFactory(ctx: ActionCtx) {
  return createAdapterFactory({
    config: {
      adapterId: 'convex',
      adapterName: 'Convex Adapter',
      usePlural: false,
      transaction: false,
      debugLogs: false,
    },
    adapter: () => (({
      create: async ({ model, data }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runMutation(internal.authDb.authCreate, { model: table, data: serializeDates(data) })
      },

      findOne: async ({ model, where }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runQuery(internal.authDb.authFindOne, { model: table, where: cleanWhere(where) })
      },

      findMany: async ({ model, where, limit }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runQuery(internal.authDb.authFindMany, {
          model: table,
          where: where ? cleanWhere(where) : undefined,
          limit,
        })
      },

      update: async ({ model, where, update }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runMutation(internal.authDb.authUpdate, {
          model: table,
          where: cleanWhere(where),
          update: serializeDates(update),
        })
      },

      updateMany: async ({ model, where, update }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runMutation(internal.authDb.authUpdateMany, {
          model: table,
          where: cleanWhere(where),
          update: serializeDates(update),
        })
      },

      delete: async ({ model, where }: any) => {
        const table = modelToConvexTable(model)
        await ctx.runMutation(internal.authDb.authDelete, {
          model: table,
          where: cleanWhere(where),
        })
      },

      deleteMany: async ({ model, where }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runMutation(internal.authDb.authDelete, {
          model: table,
          where: cleanWhere(where),
        })
      },

      count: async ({ model, where }: any) => {
        const table = modelToConvexTable(model)
        return ctx.runQuery(internal.authDb.authCount, {
          model: table,
          where: where ? cleanWhere(where) : undefined,
        })
      },
    }) as any),
  })
}

function createAuth(ctx: ActionCtx) {
  const SITE_URL = process.env.CONVEX_SITE_URL ?? 'https://terrific-octopus-580.convex.site'
  const SECRET = process.env.BETTER_AUTH_SECRET ?? 'dev-secret-please-change-me'

  return betterAuth({
    baseURL: SITE_URL,
    basePath: '/api/auth',
    secret: SECRET,
    trustedOrigins: TRUSTED_ORIGINS,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    database: createConvexAdapterFactory(ctx) as any,
  })
}

function addCorsHeaders(res: Response, origin: string | null): Response {
  const allowed = origin && TRUSTED_ORIGINS.includes(origin) ? origin : TRUSTED_ORIGINS[0]
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', allowed)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  headers.set('Vary', 'Origin')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

const authHandler = httpAction(async (ctx, req) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    const allowed = origin && TRUSTED_ORIGINS.includes(origin) ? origin : TRUSTED_ORIGINS[0]
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        'Vary': 'Origin',
      },
    })
  }

  const auth = createAuth(ctx)
  const res = await auth.handler(req)
  return addCorsHeaders(res, origin)
})

const http = httpRouter()

http.route({ pathPrefix: '/api/auth/', method: 'GET', handler: authHandler })
http.route({ pathPrefix: '/api/auth/', method: 'POST', handler: authHandler })
http.route({ pathPrefix: '/api/auth/', method: 'OPTIONS', handler: authHandler })

export default http
