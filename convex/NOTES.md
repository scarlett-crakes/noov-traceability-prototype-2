# Convex Backend — Design Notes

## Core Philosophy: Document-Native, Not SQL

Convex is a document database. Avoid thinking in joins and foreign keys.
Instead: **embed what you read together, reference what you query independently.**

---

## FIFO — First In First Out for TUs in an Asset

### The Problem
When a collector picks up UCO from a storage asset that holds multiple TUs,
they must take the **oldest TU first** (FIFO). This is a compliance rule (BRD E1).

### How We Handle It
- The **asset does NOT store a list of TU IDs** — that would be an array that grows
  unboundedly and causes write contention when multiple TUs move simultaneously.
- Instead, **each TU knows which asset it is currently in** via `current_asset_id`.
- To get the FIFO order for an asset, query TUs by asset and sort by `_creationTime` ascending:

```ts
// FIFO pickup order for an asset
ctx.db.query('traceUnits')
  .withIndex('by_asset', q => q.eq('current_asset_id', assetId))
  .filter(q => q.eq(q.field('status'), 'active'))
  .order('asc') // oldest _creationTime first
  .collect()
```

- The first result is always the one to pick first.
- **Partial draw** (taking less than a full TU): split the oldest TU first,
  take the split-off child, leave the remainder in place.

### Why not store TU list on asset?
- Arrays on documents cause write conflicts at scale
- Querying by index is faster and conflict-free
- Asset capacity is tracked via `current_kg` (a single number) — no list needed

---

## Transactions — Event Ledger for TU Movement

Transactions are an **append-only event ledger**. Every movement of a TU
from asset A to asset B is a transaction. No transaction is ever edited or deleted.

### Movement Transaction
Records source asset → destination asset for a TU:

```ts
{
  type: 'internal_move',
  tu_id,
  source_asset_id,   // where it came from
  dest_asset_id,     // where it went
  mass_kg,           // how much moved
  timestamp,
  created_by,
}
```

The TU's `current_asset_id` is updated to reflect its new location.
The transaction ledger is the permanent record of the full movement history.

---

## Split — Child Trace Units, Not Parent/Remainder

### Terminology
- The original TU that gets split is the **parent**.
- Both resulting TUs are **child trace units** (not "remainder" and "split-off").
- The parent TU is marked **consumed** after the split.
- This avoids confusion about which TU "keeps" the original ID.

### Split Flow

```
TU-001 (50 kg, active)
  └─ split(20 kg)
       ├─ TU-001-C1 (30 kg, active) — child, parent_tu_id = TU-001
       └─ TU-001-C2 (20 kg, active) — child, parent_tu_id = TU-001
TU-001 → status: consumed
```

Both children:
- Inherit the immutable `origin_snapshot` from the parent
- Have `parent_tu_id` pointing back to TU-001
- Start fresh in the event ledger (their own transaction history)
- Stay in the same asset as the parent (no location change on split)

### Split Event in the Ledger
The split is recorded as **one transaction on the parent TU**:

```ts
{
  type: 'split',
  tu_id: 'TU-001',           // parent
  child_tu_ids: ['TU-001-C1', 'TU-001-C2'],  // both children (not new_tu_id)
  split_at_kg: 20,           // the split point
  created_by,
}
```

Each child TU also gets its own first transaction:

```ts
{
  type: 'created_from_split',
  tu_id: 'TU-001-C1',
  parent_tu_id: 'TU-001',
  initial_mass_kg: 30,
  created_by,
}
```

This way the lineage is fully traceable in both directions:
- Parent → `child_tu_ids` → find children
- Child → `parent_tu_id` → find parent

---

## TU ↔ Point of Origin Linkage

A TU is linked to its PoO in **two ways**:

1. **`origin_snapshot`** (embedded, immutable) — a copy of the PoO data at collection time.
   This never changes even if the PoO record is edited later.
   This is what auditors see and what gets exported.

2. **`poo_id`** (reference, inside the snapshot) — the ID of the source PoO record,
   stored inside `origin_snapshot.poo_id`. Useful for tracing back to the original record
   but the snapshot is the source of truth for the TU.

```ts
origin_snapshot: {
  poo_id: 'abc123',       // reference to pointsOfOrigin table
  name: 'Burger Joint',   // embedded copy — immutable
  type: 'business',
  address: '...',
  signatory: '...',
  declaration_date: '...',
}
```

---

## Document-Native Modeling Principles Applied

| SQL thinking | Document-native (what we do) |
|---|---|
| Asset has FK list of TU IDs | TU has `current_asset_id` — query by index |
| Transaction just stores IDs | Transaction embeds context (mass, reason, org names) |
| Separate history table joined at read time | Events stored per-TU, read without joins |
| Parent keeps ID on split | Parent consumed, two new child TUs created |
| `new_tu_id` single field | `child_tu_ids[]` array — supports n-way splits |

---

## Schema Changes Needed (from v1)

1. **Split transaction**: replace `new_tu_id: v.id('traceUnits')` with `child_tu_ids: v.array(v.id('traceUnits'))`
2. **Split behavior**: parent TU → `status: consumed` after split (not reduced mass)
3. **New transaction type**: add `'created_from_split'` to the type union
4. **TU split mutation**: create two children, consume parent, record both events
5. **FIFO query**: already works via `order('asc')` on `by_asset` index — no changes needed
