import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Barebone users — no auth system, just role for demonstration
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('collector'), v.literal('auditor')),
    org_id: v.optional(v.id('organizations')), // null for admin (sees all orgs)
  }).index('by_email', ['email']),

  // Organizations (actors) with ISCC cert
  organizations: defineTable({
    name: v.string(),
    type: v.union(v.literal('collector'), v.literal('auditor'), v.literal('trader'), v.literal('processor')),
    contact_email: v.string(),
    is_active: v.boolean(),
    cert_number: v.optional(v.string()),
    cert_expiry: v.optional(v.string()),
    cert_status: v.optional(v.union(v.literal('ACTIVE'), v.literal('EXPIRED'))),
  }),

  // Storage assets (tanks, warehouses, vehicles)
  assets: defineTable({
    name: v.string(),
    type: v.union(v.literal('warehouse'), v.literal('vehicle'), v.literal('processing'), v.literal('quarantine')),
    location: v.string(),
    capacity_kg: v.number(),
    current_kg: v.number(),
    status: v.union(v.literal('active'), v.literal('inactive')),
    owner_org_id: v.id('organizations'),
  }).index('by_org', ['owner_org_id']),

  // Points of Origin — org-owned depositor records (not logins)
  pointsOfOrigin: defineTable({
    name: v.string(),
    type: v.union(v.literal('business'), v.literal('individual')),
    address: v.string(),
    phone: v.optional(v.string()),
    signatory: v.string(),
    declaration_date: v.string(),
    owner_org_id: v.id('organizations'),
  }).index('by_org', ['owner_org_id']),

  // Trace Units — core entity
  traceUnits: defineTable({
    // Identity
    tu_code: v.string(),                     // human-readable e.g. TU-2026-0001
    parent_tu_id: v.optional(v.id('traceUnits')), // set if created by split

    // Immutable origin snapshot (copied at creation, never changes)
    origin_snapshot: v.object({
      poo_id: v.string(),
      name: v.string(),
      type: v.string(),
      address: v.string(),
      phone: v.optional(v.string()),
      signatory: v.string(),
      declaration_date: v.string(),
    }),

    // Mutable state
    status: v.union(
      v.literal('active'),
      v.literal('in_transit'),
      v.literal('lost'),
      v.literal('consumed'),
      v.literal('quarantine'),
    ),
    product_type: v.union(v.literal('UCO'), v.literal('Refined UCO')),
    mass_kg: v.number(),

    // Current custody
    current_asset_id: v.id('assets'),
    current_owner_org_id: v.id('organizations'),
    creator_org_id: v.id('organizations'),
  })
    .index('by_status', ['status'])
    .index('by_owner', ['current_owner_org_id'])
    .index('by_asset', ['current_asset_id']),

  // ─── better-auth tables ─────────────────────────────────────────────────────
  authUsers: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),

  authSessions: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.string(),
  }).index('by_token', ['token']).index('by_user', ['userId']),

  authAccounts: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_account', ['providerId', 'accountId']).index('by_user', ['userId']),

  authVerifications: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index('by_identifier', ['identifier']),

  // Transactions — immutable append-only event log
  transactions: defineTable({
    type: v.union(
      v.literal('collection'),
      v.literal('internal_move'),
      v.literal('external_sale'),
      v.literal('split'),
      v.literal('created_from_split'),
      v.literal('loss'),
    ),
    tu_id: v.id('traceUnits'),
    created_by: v.id('users'),
    notes: v.optional(v.string()),

    // Fields vary by type — all optional, populated as needed
    source_asset_id: v.optional(v.id('assets')),
    dest_asset_id: v.optional(v.id('assets')),
    source_org_id: v.optional(v.id('organizations')),
    dest_org_id: v.optional(v.id('organizations')),

    // Split fields — child_tu_ids on parent's split event; parent_tu_id on child's created_from_split event
    split_kg: v.optional(v.number()),
    child_tu_ids: v.optional(v.array(v.id('traceUnits'))),
    parent_tu_id: v.optional(v.id('traceUnits')),
    initial_mass_kg: v.optional(v.number()),

    // Loss fields
    loss_kg: v.optional(v.number()),
    loss_reason: v.optional(v.string()),

    // External sale
    price_per_kg: v.optional(v.number()),   // stored but not shown to auditors
  })
    .index('by_tu', ['tu_id'])
    .index('by_type', ['type']),
})
