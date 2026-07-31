import { internalQuery, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

type AuthTable = 'authUsers' | 'authSessions' | 'authAccounts' | 'authVerifications'

function modelToTable(model: string): AuthTable {
  const map: Record<string, AuthTable> = {
    user: 'authUsers',
    session: 'authSessions',
    account: 'authAccounts',
    verification: 'authVerifications',
  }
  return (map[model] ?? model) as AuthTable
}

type WhereItem = {
  field: string
  value: string | number | boolean | null | string[]
  operator?: string
  connector?: string
}

function docMatchesWhere(doc: Record<string, unknown>, where: WhereItem[]): boolean {
  return where.every(({ field, value, operator = 'eq' }) => {
    const docVal = field === 'id' ? String(doc._id) : doc[field]
    if (operator === 'eq') return docVal === value
    if (operator === 'ne') return docVal !== value
    if (operator === 'gt') return (docVal as number) > (value as number)
    if (operator === 'lt') return (docVal as number) < (value as number)
    if (operator === 'gte') return (docVal as number) >= (value as number)
    if (operator === 'lte') return (docVal as number) <= (value as number)
    if (operator === 'in' && Array.isArray(value)) return value.includes(docVal as string)
    if (operator === 'not_in' && Array.isArray(value)) return !value.includes(docVal as string)
    if (operator === 'contains' && typeof docVal === 'string' && typeof value === 'string') return docVal.includes(value)
    if (operator === 'starts_with' && typeof docVal === 'string' && typeof value === 'string') return docVal.startsWith(value)
    if (operator === 'ends_with' && typeof docVal === 'string' && typeof value === 'string') return docVal.endsWith(value)
    return docVal === value
  })
}

function withId(doc: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!doc) return null
  return { ...doc, id: String(doc._id) }
}

const whereValidator = v.array(v.object({
  field: v.string(),
  value: v.union(v.string(), v.number(), v.boolean(), v.null(), v.array(v.string())),
  operator: v.optional(v.string()),
  connector: v.optional(v.string()),
}))

// ─── Queries ──────────────────────────────────────────────────────────────────

export const authFindOne = internalQuery({
  args: { model: v.string(), where: whereValidator },
  handler: async (ctx, { model, where }) => {
    const table = modelToTable(model)

    // Fast indexed paths
    if (where.length >= 1) {
      const single = where[0]
      const op = single.operator ?? 'eq'

      if (op === 'eq' && where.length === 1) {
        if (single.field === 'id') {
          try {
            const doc = await ctx.db.get(single.value as Id<typeof table>)
            return withId(doc as Record<string, unknown> | null)
          } catch { return null }
        }
        if (single.field === 'email' && table === 'authUsers') {
          const doc = await ctx.db.query('authUsers')
            .withIndex('by_email', q => q.eq('email', single.value as string)).first()
          return withId(doc as Record<string, unknown> | null)
        }
        if (single.field === 'token' && table === 'authSessions') {
          const doc = await ctx.db.query('authSessions')
            .withIndex('by_token', q => q.eq('token', single.value as string)).first()
          return withId(doc as Record<string, unknown> | null)
        }
        if (single.field === 'identifier' && table === 'authVerifications') {
          const doc = await ctx.db.query('authVerifications')
            .withIndex('by_identifier', q => q.eq('identifier', single.value as string)).first()
          return withId(doc as Record<string, unknown> | null)
        }
      }

      // account lookup by providerId + accountId
      if (table === 'authAccounts' && where.length === 2) {
        const prov = where.find(w => w.field === 'providerId')
        const acct = where.find(w => w.field === 'accountId')
        if (prov && acct) {
          const doc = await ctx.db.query('authAccounts')
            .withIndex('by_account', q =>
              q.eq('providerId', prov.value as string).eq('accountId', acct.value as string))
            .first()
          return withId(doc as Record<string, unknown> | null)
        }
      }
    }

    // Fallback: linear scan
    const all = await (ctx.db.query(table) as any).collect()
    const found = (all as Record<string, unknown>[]).find(doc => docMatchesWhere(doc, where))
    return withId(found ?? null)
  },
})

export const authFindMany = internalQuery({
  args: {
    model: v.string(),
    where: v.optional(whereValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { model, where, limit }) => {
    const table = modelToTable(model)
    let results: Record<string, unknown>[]

    // Use index for userId lookups
    if (where?.length === 1 && where[0].field === 'userId' && (where[0].operator ?? 'eq') === 'eq') {
      const uid = where[0].value as string
      if (table === 'authSessions') {
        results = await ctx.db.query('authSessions').withIndex('by_user', q => q.eq('userId', uid)).collect() as any
      } else if (table === 'authAccounts') {
        results = await ctx.db.query('authAccounts').withIndex('by_user', q => q.eq('userId', uid)).collect() as any
      } else {
        results = await (ctx.db.query(table) as any).collect()
      }
    } else {
      results = await (ctx.db.query(table) as any).collect()
      if (where) results = results.filter(doc => docMatchesWhere(doc, where))
    }

    const out = results.map(doc => withId(doc)!) as Record<string, unknown>[]
    return limit ? out.slice(0, limit) : out
  },
})

// ─── Mutations ────────────────────────────────────────────────────────────────

export const authCreate = internalMutation({
  args: { model: v.string(), data: v.any() },
  handler: async (ctx, { model, data }) => {
    const table = modelToTable(model)
    const { id: _ignored, ...rest } = data as Record<string, unknown>
    const docId = await ctx.db.insert(table as any, rest as any)
    const doc = await ctx.db.get(docId)
    return withId(doc as Record<string, unknown>)
  },
})

export const authUpdate = internalMutation({
  args: { model: v.string(), where: whereValidator, update: v.any() },
  handler: async (ctx, { model, where, update }) => {
    const table = modelToTable(model)
    let doc: Record<string, unknown> | null = null

    if (where.length === 1 && where[0].field === 'id') {
      try { doc = await ctx.db.get(where[0].value as any) as any } catch {}
    } else if (where.length === 1 && where[0].field === 'token' && table === 'authSessions') {
      doc = await ctx.db.query('authSessions')
        .withIndex('by_token', q => q.eq('token', where[0].value as string)).first() as any
    } else {
      const all = await (ctx.db.query(table) as any).collect()
      doc = (all as Record<string, unknown>[]).find(d => docMatchesWhere(d, where)) ?? null
    }

    if (!doc) return null
    await ctx.db.patch(doc._id as any, update as any)
    const updated = await ctx.db.get(doc._id as any)
    return withId(updated as Record<string, unknown>)
  },
})

export const authUpdateMany = internalMutation({
  args: { model: v.string(), where: whereValidator, update: v.any() },
  handler: async (ctx, { model, where, update }) => {
    const table = modelToTable(model)
    const all = await (ctx.db.query(table) as any).collect() as Record<string, unknown>[]
    const matches = all.filter(d => docMatchesWhere(d, where))
    for (const doc of matches) {
      await ctx.db.patch(doc._id as any, update as any)
    }
    return matches.length
  },
})

export const authCount = internalQuery({
  args: { model: v.string(), where: v.optional(whereValidator) },
  handler: async (ctx, { model, where }) => {
    const table = modelToTable(model)
    const all = await (ctx.db.query(table) as any).collect() as Record<string, unknown>[]
    if (!where) return all.length
    return all.filter(d => docMatchesWhere(d, where)).length
  },
})

export const authDelete = internalMutation({
  args: { model: v.string(), where: whereValidator },
  handler: async (ctx, { model, where }) => {
    const table = modelToTable(model)
    let docs: Record<string, unknown>[]

    if (where.length === 1 && where[0].field === 'id') {
      try {
        const doc = await ctx.db.get(where[0].value as any)
        docs = doc ? [doc as Record<string, unknown>] : []
      } catch { docs = [] }
    } else if (where.length === 1 && where[0].field === 'userId' && table === 'authSessions') {
      docs = await ctx.db.query('authSessions')
        .withIndex('by_user', q => q.eq('userId', where[0].value as string)).collect() as any
    } else if (where.length === 1 && where[0].field === 'userId' && table === 'authAccounts') {
      docs = await ctx.db.query('authAccounts')
        .withIndex('by_user', q => q.eq('userId', where[0].value as string)).collect() as any
    } else if (where.length === 1 && where[0].field === 'identifier' && table === 'authVerifications') {
      docs = await ctx.db.query('authVerifications')
        .withIndex('by_identifier', q => q.eq('identifier', where[0].value as string)).collect() as any
    } else {
      const all = await (ctx.db.query(table) as any).collect() as Record<string, unknown>[]
      docs = all.filter(d => docMatchesWhere(d, where))
    }

    for (const doc of docs) {
      await ctx.db.delete(doc._id as any)
    }
    return docs.length
  },
})
