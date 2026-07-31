import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    // FIFO: return sorted by creation time ascending (oldest first)
    return await ctx.db.query('traceUnits').order('asc').collect()
  },
})

export const listByOrg = query({
  args: { org_id: v.id('organizations') },
  handler: async (ctx, { org_id }) => {
    return await ctx.db
      .query('traceUnits')
      .withIndex('by_owner', q => q.eq('current_owner_org_id', org_id))
      .order('asc')
      .collect()
  },
})

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db.query('traceUnits').withIndex('by_status', (q) => q.eq('status', status as any)).collect()
  },
})

export const listByAsset = query({
  args: { asset_id: v.id('assets') },
  handler: async (ctx, { asset_id }) => {
    // Returns TUs in a storage sorted oldest first (FIFO pickup order)
    return await ctx.db.query('traceUnits').withIndex('by_asset', (q) => q.eq('current_asset_id', asset_id)).order('asc').collect()
  },
})

export const get = query({
  args: { id: v.id('traceUnits') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const getHistory = query({
  args: { id: v.id('traceUnits') },
  handler: async (ctx, { id }) => {
    return await ctx.db.query('transactions').withIndex('by_tu', (q) => q.eq('tu_id', id)).order('asc').collect()
  },
})

export const getLineage = query({
  args: { id: v.id('traceUnits') },
  handler: async (ctx, { id }) => {
    const tu = await ctx.db.get(id)
    if (!tu) return null

    const tuAsset = await ctx.db.get(tu.current_asset_id)

    // Collect parent chain with their assets
    const parents: any[] = []
    let current = tu
    while (current.parent_tu_id) {
      const parent = await ctx.db.get(current.parent_tu_id)
      if (!parent) break
      const parentAsset = await ctx.db.get(parent.current_asset_id)
      parents.unshift({ ...parent, asset_name: parentAsset?.name ?? null })
      current = parent
    }

    // Collect split children with their assets
    const children = await ctx.db.query('traceUnits').collect()
    const splitChildren = await Promise.all(
      children
        .filter(t => t.parent_tu_id === id)
        .map(async child => {
          const childAsset = await ctx.db.get(child.current_asset_id)
          return { ...child, asset_name: childAsset?.name ?? null }
        })
    )

    return { tu: { ...tu, asset_name: tuAsset?.name ?? null }, parents, splitChildren }
  },
})

// Collection — creates a new TU at a Point of Origin
export const collect = mutation({
  args: {
    poo_id: v.id('pointsOfOrigin'),
    asset_id: v.id('assets'),
    owner_org_id: v.id('organizations'),
    creator_user_id: v.id('users'),
    product_type: v.union(v.literal('UCO'), v.literal('Refined UCO')),
    mass_kg: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const poo = await ctx.db.get(args.poo_id)
    if (!poo) throw new Error('Point of Origin not found')

    const asset = await ctx.db.get(args.asset_id)
    if (!asset) throw new Error('Asset not found')
    if (asset.current_kg + args.mass_kg > asset.capacity_kg) {
      throw new Error(`Exceeds asset capacity. Available: ${asset.capacity_kg - asset.current_kg} kg`)
    }

    // Generate TU code
    const count = await ctx.db.query('traceUnits').collect()
    const tuCode = `TU-${new Date().getFullYear()}-${String(count.length + 1).padStart(4, '0')}`

    // Snapshot the PoO immutably onto the TU
    const originSnapshot = {
      poo_id: args.poo_id,
      name: poo.name,
      type: poo.type,
      address: poo.address,
      phone: poo.phone,
      signatory: poo.signatory,
      declaration_date: poo.declaration_date,
    }

    const tuId = await ctx.db.insert('traceUnits', {
      tu_code: tuCode,
      origin_snapshot: originSnapshot,
      status: 'active',
      product_type: args.product_type,
      mass_kg: args.mass_kg,
      current_asset_id: args.asset_id,
      current_owner_org_id: args.owner_org_id,
      creator_org_id: args.owner_org_id,
    })

    // Update asset load
    await ctx.db.patch(args.asset_id, { current_kg: asset.current_kg + args.mass_kg })

    // Record transaction
    await ctx.db.insert('transactions', {
      type: 'collection',
      tu_id: tuId,
      created_by: args.creator_user_id,
      dest_asset_id: args.asset_id,
      dest_org_id: args.owner_org_id,
      notes: args.notes,
    })

    return tuId
  },
})

// FIFO pickup — server selects the oldest active TU from source asset.
// If the oldest TU has more mass than requested, it is split first and only
// the requested portion moves. Caller never specifies a tu_id.
export const pickNext = mutation({
  args: {
    source_asset_id: v.id('assets'),
    dest_asset_id: v.id('assets'),
    kg_requested: v.number(),
    user_id: v.id('users'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.kg_requested <= 0) throw new Error('kg_requested must be greater than 0')
    if (args.source_asset_id === args.dest_asset_id) throw new Error('Source and destination must be different')

    const destAsset = await ctx.db.get(args.dest_asset_id)
    if (!destAsset) throw new Error('Destination asset not found')

    // FIFO: oldest active TU in the source asset
    const fifoTU = await ctx.db
      .query('traceUnits')
      .withIndex('by_asset', q => q.eq('current_asset_id', args.source_asset_id))
      .filter(q => q.eq(q.field('status'), 'active'))
      .order('asc')
      .first()

    if (!fifoTU) throw new Error('No active trace units in this asset')

    if (destAsset.current_kg + args.kg_requested > destAsset.capacity_kg) {
      throw new Error(`Exceeds destination capacity. Available: ${destAsset.capacity_kg - destAsset.current_kg} kg`)
    }

    let tuToMoveId = fifoTU._id
    let massMoving = fifoTU.mass_kg

    if (fifoTU.mass_kg > args.kg_requested) {
      // Need a partial draw — split the oldest TU first, then move the smaller child
      const remainderKg = fifoTU.mass_kg - args.kg_requested

      const allTUs = await ctx.db.query('traceUnits').collect()
      const existingChildCount = allTUs.filter(t => t.parent_tu_id === fifoTU._id).length

      const childCode1 = `${fifoTU.tu_code}-C${existingChildCount + 1}` // remainder stays
      const childCode2 = `${fifoTU.tu_code}-C${existingChildCount + 2}` // this one moves

      const remainderId = await ctx.db.insert('traceUnits', {
        tu_code: childCode1,
        parent_tu_id: fifoTU._id,
        origin_snapshot: fifoTU.origin_snapshot,
        status: 'active',
        product_type: fifoTU.product_type,
        mass_kg: remainderKg,
        current_asset_id: args.source_asset_id,
        current_owner_org_id: fifoTU.current_owner_org_id,
        creator_org_id: fifoTU.creator_org_id,
      })

      const portionId = await ctx.db.insert('traceUnits', {
        tu_code: childCode2,
        parent_tu_id: fifoTU._id,
        origin_snapshot: fifoTU.origin_snapshot,
        status: 'active',
        product_type: fifoTU.product_type,
        mass_kg: args.kg_requested,
        current_asset_id: args.source_asset_id,
        current_owner_org_id: fifoTU.current_owner_org_id,
        creator_org_id: fifoTU.creator_org_id,
      })

      // Consume the original TU
      await ctx.db.patch(fifoTU._id, { status: 'consumed' })

      // Adjust source asset load: parent mass replaced by two children, net change = 0 so no adjustment needed
      // (children sum to same mass as parent)

      // Record split events
      await ctx.db.insert('transactions', {
        type: 'split',
        tu_id: fifoTU._id,
        created_by: args.user_id,
        split_kg: args.kg_requested,
        child_tu_ids: [remainderId, portionId],
        notes: `FIFO partial draw: split into ${childCode1} (${remainderKg} kg) and ${childCode2} (${args.kg_requested} kg)`,
      })

      await ctx.db.insert('transactions', {
        type: 'created_from_split',
        tu_id: remainderId,
        created_by: args.user_id,
        parent_tu_id: fifoTU._id,
        initial_mass_kg: remainderKg,
      })

      await ctx.db.insert('transactions', {
        type: 'created_from_split',
        tu_id: portionId,
        created_by: args.user_id,
        parent_tu_id: fifoTU._id,
        initial_mass_kg: args.kg_requested,
      })

      tuToMoveId = portionId
      massMoving = args.kg_requested
    } else if (fifoTU.mass_kg < args.kg_requested) {
      throw new Error(
        `Oldest TU only has ${fifoTU.mass_kg} kg. Request ${fifoTU.mass_kg} kg or less, or move the full TU.`
      )
    }

    // Move the TU (either the original full TU or the newly split child)
    const srcAsset = await ctx.db.get(args.source_asset_id)

    await ctx.db.patch(tuToMoveId, { current_asset_id: args.dest_asset_id })

    if (srcAsset) {
      await ctx.db.patch(args.source_asset_id, {
        current_kg: Math.max(0, srcAsset.current_kg - massMoving),
      })
    }
    await ctx.db.patch(args.dest_asset_id, {
      current_kg: destAsset.current_kg + massMoving,
    })

    await ctx.db.insert('transactions', {
      type: 'internal_move',
      tu_id: tuToMoveId,
      created_by: args.user_id,
      source_asset_id: args.source_asset_id,
      dest_asset_id: args.dest_asset_id,
      source_org_id: fifoTU.current_owner_org_id,
      dest_org_id: fifoTU.current_owner_org_id,
      notes: args.notes,
    })

    return { tu_id: tuToMoveId, mass_kg: massMoving }
  },
})

// Internal move — admin override, caller specifies exact TU by ID
// Normal collector workflow should use pickNext instead
export const moveInternal = mutation({
  args: {
    tu_id: v.id('traceUnits'),
    dest_asset_id: v.id('assets'),
    user_id: v.id('users'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tu = await ctx.db.get(args.tu_id)
    if (!tu) throw new Error('Trace unit not found')
    if (tu.status !== 'active') throw new Error('Only active TUs can be moved')

    const destAsset = await ctx.db.get(args.dest_asset_id)
    if (!destAsset) throw new Error('Destination asset not found')
    if (destAsset.current_kg + tu.mass_kg > destAsset.capacity_kg) {
      throw new Error(`Exceeds destination capacity. Available: ${destAsset.capacity_kg - destAsset.current_kg} kg`)
    }

    const srcAssetId = tu.current_asset_id
    const srcAsset = await ctx.db.get(srcAssetId)

    // Move TU
    await ctx.db.patch(args.tu_id, { current_asset_id: args.dest_asset_id })

    // Update asset loads
    if (srcAsset) await ctx.db.patch(srcAssetId, { current_kg: Math.max(0, srcAsset.current_kg - tu.mass_kg) })
    await ctx.db.patch(args.dest_asset_id, { current_kg: destAsset.current_kg + tu.mass_kg })

    await ctx.db.insert('transactions', {
      type: 'internal_move',
      tu_id: args.tu_id,
      created_by: args.user_id,
      source_asset_id: srcAssetId,
      dest_asset_id: args.dest_asset_id,
      source_org_id: tu.current_owner_org_id,
      dest_org_id: tu.current_owner_org_id,
      notes: args.notes,
    })
  },
})

// Split — parent is consumed; two child TUs are created, both inheriting origin_snapshot
export const split = mutation({
  args: {
    tu_id: v.id('traceUnits'),
    split_kg: v.number(),
    user_id: v.id('users'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tu = await ctx.db.get(args.tu_id)
    if (!tu) throw new Error('Trace unit not found')
    if (tu.status !== 'active') throw new Error('Only active TUs can be split')
    if (args.split_kg <= 0 || args.split_kg >= tu.mass_kg) {
      throw new Error('Split amount must be between 0 and the full mass')
    }

    const remainderKg = tu.mass_kg - args.split_kg

    // Count existing children to generate -C1, -C2, ... suffixes
    const allTUs = await ctx.db.query('traceUnits').collect()
    const existingChildCount = allTUs.filter((t) => t.parent_tu_id === args.tu_id).length

    const childCode1 = `${tu.tu_code}-C${existingChildCount + 1}`
    const childCode2 = `${tu.tu_code}-C${existingChildCount + 2}`

    // Create child TU 1 — remainder mass
    const child1Id = await ctx.db.insert('traceUnits', {
      tu_code: childCode1,
      parent_tu_id: args.tu_id,
      origin_snapshot: tu.origin_snapshot,
      status: 'active',
      product_type: tu.product_type,
      mass_kg: remainderKg,
      current_asset_id: tu.current_asset_id,
      current_owner_org_id: tu.current_owner_org_id,
      creator_org_id: tu.creator_org_id,
    })

    // Create child TU 2 — split-off mass
    const child2Id = await ctx.db.insert('traceUnits', {
      tu_code: childCode2,
      parent_tu_id: args.tu_id,
      origin_snapshot: tu.origin_snapshot,
      status: 'active',
      product_type: tu.product_type,
      mass_kg: args.split_kg,
      current_asset_id: tu.current_asset_id,
      current_owner_org_id: tu.current_owner_org_id,
      creator_org_id: tu.creator_org_id,
    })

    // Consume parent
    await ctx.db.patch(args.tu_id, { status: 'consumed' })

    // Event on parent — records both children
    await ctx.db.insert('transactions', {
      type: 'split',
      tu_id: args.tu_id,
      created_by: args.user_id,
      split_kg: args.split_kg,
      child_tu_ids: [child1Id, child2Id],
      notes: args.notes ?? `Split into ${childCode1} (${remainderKg} kg) and ${childCode2} (${args.split_kg} kg)`,
    })

    // Event on each child — records their parent
    await ctx.db.insert('transactions', {
      type: 'created_from_split',
      tu_id: child1Id,
      created_by: args.user_id,
      parent_tu_id: args.tu_id,
      initial_mass_kg: remainderKg,
    })

    await ctx.db.insert('transactions', {
      type: 'created_from_split',
      tu_id: child2Id,
      created_by: args.user_id,
      parent_tu_id: args.tu_id,
      initial_mass_kg: args.split_kg,
    })

    return { child1Id, child2Id }
  },
})

// Loss — reduce mass, optionally mark as lost
export const recordLoss = mutation({
  args: {
    tu_id: v.id('traceUnits'),
    loss_kg: v.number(),
    loss_reason: v.string(),
    user_id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const tu = await ctx.db.get(args.tu_id)
    if (!tu) throw new Error('Trace unit not found')
    if (tu.status !== 'active') throw new Error('Only active TUs can record a loss')
    if (args.loss_kg <= 0 || args.loss_kg > tu.mass_kg) throw new Error('Invalid loss amount')

    const remaining = tu.mass_kg - args.loss_kg
    await ctx.db.patch(args.tu_id, {
      mass_kg: remaining,
      status: remaining === 0 ? 'lost' : 'active',
    })

    const asset = await ctx.db.get(tu.current_asset_id)
    if (asset) await ctx.db.patch(tu.current_asset_id, { current_kg: Math.max(0, asset.current_kg - args.loss_kg) })

    await ctx.db.insert('transactions', {
      type: 'loss',
      tu_id: args.tu_id,
      created_by: args.user_id,
      loss_kg: args.loss_kg,
      loss_reason: args.loss_reason,
    })
  },
})
