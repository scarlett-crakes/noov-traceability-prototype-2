import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('organizations').collect()
  },
})

export const get = query({
  args: { id: v.id('organizations') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal('collector'), v.literal('auditor'), v.literal('trader'), v.literal('processor')),
    contact_email: v.string(),
    cert_number: v.optional(v.string()),
    cert_expiry: v.optional(v.string()),
    cert_status: v.optional(v.union(v.literal('ACTIVE'), v.literal('EXPIRED'))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('organizations', { ...args, is_active: true })
  },
})

export const setActive = mutation({
  args: { id: v.id('organizations'), is_active: v.boolean() },
  handler: async (ctx, { id, is_active }) => {
    await ctx.db.patch(id, { is_active })
  },
})

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('organizations').collect()
    if (existing.length > 0) return 'already seeded'

    await ctx.db.insert('organizations', { name: 'UCO Collectors Inc', type: 'collector', contact_email: 'ops@ucocollectors.com', is_active: true, cert_number: 'ISCC-EU-2024-001234', cert_expiry: '2027-03-31', cert_status: 'ACTIVE' })
    await ctx.db.insert('organizations', { name: 'UCO Analytics Lab', type: 'auditor', contact_email: 'lab@ucoanalytics.com', is_active: true, cert_number: 'ISCC-EU-2024-005678', cert_expiry: '2026-08-15', cert_status: 'ACTIVE' })
    await ctx.db.insert('organizations', { name: 'Green Fuels Trading Ltd', type: 'trader', contact_email: 'trade@greenfuels.com', is_active: true, cert_number: 'ISCC-EU-2023-009999', cert_expiry: '2025-12-31', cert_status: 'EXPIRED' })

    return 'seeded 3 organizations'
  },
})
