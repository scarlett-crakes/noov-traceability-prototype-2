import { query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('transactions').order('desc').collect()
  },
})

export const listByTU = query({
  args: { tu_id: v.id('traceUnits') },
  handler: async (ctx, { tu_id }) => {
    return await ctx.db.query('transactions').withIndex('by_tu', q => q.eq('tu_id', tu_id)).order('asc').collect()
  },
})
