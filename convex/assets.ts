import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('assets').collect()
  },
})

export const listByOrg = query({
  args: { org_id: v.id('organizations') },
  handler: async (ctx, { org_id }) => {
    return await ctx.db.query('assets').withIndex('by_org', (q) => q.eq('owner_org_id', org_id)).collect()
  },
})

export const get = query({
  args: { id: v.id('assets') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal('warehouse'), v.literal('vehicle'), v.literal('processing'), v.literal('quarantine')),
    location: v.string(),
    capacity_kg: v.number(),
    owner_org_id: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('assets', { ...args, current_kg: 0, status: 'active' })
  },
})

// Internal helper — adjust current_kg when TUs move in/out
export const adjustLoad = mutation({
  args: { id: v.id('assets'), delta_kg: v.number() },
  handler: async (ctx, { id, delta_kg }) => {
    const asset = await ctx.db.get(id)
    if (!asset) throw new Error('Asset not found')
    const newKg = asset.current_kg + delta_kg
    if (newKg < 0) throw new Error('Cannot remove more than current load')
    if (newKg > asset.capacity_kg) throw new Error(`Exceeds capacity: ${asset.capacity_kg} kg`)
    await ctx.db.patch(id, { current_kg: newKg })
  },
})

export const seed = mutation({
  args: { org_id: v.id('organizations') },
  handler: async (ctx, { org_id }) => {
    const existing = await ctx.db.query('assets').collect()
    if (existing.length > 0) return 'already seeded'

    await ctx.db.insert('assets', { name: 'Warehouse A', type: 'warehouse', location: '100 Industrial Blvd, Los Angeles, CA', capacity_kg: 5000, current_kg: 2340, status: 'active', owner_org_id: org_id })
    await ctx.db.insert('assets', { name: 'Warehouse B', type: 'warehouse', location: '200 Commerce St, Los Angeles, CA', capacity_kg: 3000, current_kg: 1100, status: 'active', owner_org_id: org_id })
    await ctx.db.insert('assets', { name: 'Quarantine Bay', type: 'quarantine', location: '100 Industrial Blvd, Los Angeles, CA', capacity_kg: 500, current_kg: 48, status: 'active', owner_org_id: org_id })
    await ctx.db.insert('assets', { name: 'Collection Vehicle 01', type: 'vehicle', location: 'Mobile — Los Angeles area', capacity_kg: 800, current_kg: 0, status: 'active', owner_org_id: org_id })

    return 'seeded 4 assets'
  },
})
