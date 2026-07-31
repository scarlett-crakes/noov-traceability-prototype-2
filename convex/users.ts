// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: { env: Record<string, string | undefined> }

import { query, mutation, action } from './_generated/server'
import { v } from 'convex/values'
import type { GenericActionCtx } from 'convex/server'
import type { DataModel } from './_generated/dataModel'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', email)).first()
    if (!user) return null
    const org = user.org_id ? await ctx.db.get(user.org_id) : null
    return { ...user, org }
  },
})

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('users').collect()
    if (existing.length > 0) return 'already seeded'

    // Seed orgs first if not done, then link users
    const orgs = await ctx.db.query('organizations').collect()
    const collectorOrg = orgs.find(o => o.type === 'collector')
    const auditorOrg = orgs.find(o => o.type === 'auditor')

    await ctx.db.insert('users', { name: 'Admin User', email: 'admin@tracy.com', role: 'admin' })
    await ctx.db.insert('users', {
      name: 'Collector A',
      email: 'collector@tracy.com',
      role: 'collector',
      org_id: collectorOrg?._id,
    })
    await ctx.db.insert('users', {
      name: 'Auditor A',
      email: 'auditor@tracy.com',
      role: 'auditor',
      org_id: auditorOrg?._id,
    })

    return 'seeded 3 users'
  },
})

// One-time seed for better-auth test accounts — run via: npx convex run users:seedAuthUsers
// Calls the Convex HTTP auth endpoint directly to create accounts.
export const seedAuthUsers = action({
  args: {},
  handler: async (_ctx: GenericActionCtx<DataModel>) => {
    const SITE_URL = process.env.CONVEX_SITE_URL ?? 'https://terrific-octopus-580.convex.site'
    const BASE = `${SITE_URL}/api/auth`

    const testUsers = [
      { email: 'admin@tracy.com', password: 'admin123', name: 'Admin User' },
      { email: 'collector@tracy.com', password: 'collector123', name: 'Collector A' },
      { email: 'auditor@tracy.com', password: 'auditor123', name: 'Auditor A' },
    ]

    const results: string[] = []
    for (const u of testUsers) {
      try {
        const res = await fetch(`${BASE}/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Origin': SITE_URL },
          body: JSON.stringify({ email: u.email, password: u.password, name: u.name }),
        })
        const body = await res.json().catch(() => ({})) as any
        if (res.ok) {
          results.push(`created: ${u.email}`)
        } else {
          results.push(`skipped ${u.email}: ${body?.message ?? res.status}`)
        }
      } catch (err: any) {
        results.push(`error ${u.email}: ${err?.message}`)
      }
    }
    return results
  },
})
