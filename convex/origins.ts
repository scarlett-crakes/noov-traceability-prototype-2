import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('pointsOfOrigin').collect()
  },
})

export const listByOrg = query({
  args: { org_id: v.id('organizations') },
  handler: async (ctx, { org_id }) => {
    return await ctx.db.query('pointsOfOrigin').withIndex('by_org', (q) => q.eq('owner_org_id', org_id)).collect()
  },
})

export const get = query({
  args: { id: v.id('pointsOfOrigin') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal('business'), v.literal('individual')),
    address: v.string(),
    phone: v.optional(v.string()),
    signatory: v.string(),
    declaration_date: v.string(),
    owner_org_id: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('pointsOfOrigin', args)
  },
})

// PoO records are immutable after creation — no update mutation
