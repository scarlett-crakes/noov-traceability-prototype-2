import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Lock, GitBranch, Scissors, X } from 'lucide-react'
import { StatusBadge, Badge } from '@/lib/components/Badge'
import { useAuth } from '@/lib/AuthContext'
import type { Id } from '../../convex/_generated/dataModel'

const eventTypeColors: Record<string, 'active' | 'transit' | 'quarantine' | 'consumed' | 'default'> = {
  collection: 'active',
  internal_move: 'transit',
  split: 'default',
  created_from_split: 'default',
  loss: 'consumed',
}

export function TraceUnitDetail() {
  const { id } = useParams({ from: '/app/trace-units/$id' })
  const { role, user } = useAuth()
  const { orgId } = useAuth()
  const tu = useQuery(api.traceUnits.get, { id: id as Id<'traceUnits'> })
  const history = useQuery(api.traceUnits.getHistory, { id: id as Id<'traceUnits'> }) ?? []
  const lineage = useQuery(api.traceUnits.getLineage, { id: id as Id<'traceUnits'> })
  const splitMutation = useMutation(api.traceUnits.split)
  const moveMutation = useMutation(api.traceUnits.moveInternal)

  // Load assets for destination picker — org-scoped for collector, all for admin
  const orgAssets = useQuery(api.assets.listByOrg, orgId ? { org_id: orgId } : 'skip') ?? []
  const allAssets = useQuery(api.assets.list, role === 'admin' ? {} : 'skip') ?? []
  const availableAssets = role === 'admin' ? allAssets : orgAssets

  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [showSplit, setShowSplit] = useState(false)
  const [splitKg, setSplitKg] = useState('')
  const [destAssetId, setDestAssetId] = useState('')
  const [splitDone, setSplitDone] = useState(false)
  const [splitError, setSplitError] = useState<string | null>(null)

  const canEdit = role === 'admin' || role === 'collector'

  if (tu === undefined) {
    return <div className="p-6 text-sm text-gray-400">Loading…</div>
  }

  if (tu === null) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-red-600 text-sm">Trace unit not found.</p>
          <Link to="/inventory" className="text-sm text-emerald-700 underline mt-3 inline-block">Back to Inventory</Link>
        </div>
      </div>
    )
  }

  const parentTU = lineage?.parents.at(-1) ?? null
  const splitChildren = lineage?.splitChildren ?? []

  async function handleSplit(e: React.FormEvent) {
    e.preventDefault()
    setSplitError(null)
    if (!user || !tu) return
    try {
      const result = await splitMutation({
        tu_id: tu._id,
        split_kg: parseFloat(splitKg),
        user_id: user._id,
      })
      // If a destination asset was chosen, move the split-off child (child2) there
      if (destAssetId && result?.child2Id) {
        await moveMutation({
          tu_id: result.child2Id,
          dest_asset_id: destAssetId as Id<'assets'>,
          user_id: user._id,
          notes: `Moved after split`,
        })
      }
      setSplitDone(true)
      setShowSplit(false)
      setSplitKg('')
      setDestAssetId('')
    } catch (err: any) {
      setSplitError(err.message ?? 'Split failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium text-gray-900 font-mono">{tu.tu_code}</h1>
          {tu.parent_tu_id && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">child TU</span>
          )}
        </div>
        <Link to="/inventory" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {splitDone && (
        <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800">
          Split complete — two child trace units created. Original TU is now consumed.
        </div>
      )}

      <div className="p-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Current State</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mass</p>
                <p className="text-lg font-medium text-gray-900">{tu.mass_kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <StatusBadge status={tu.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Product Type</p>
                <p className="text-gray-900">{tu.product_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created</p>
                <p className="text-gray-900">{new Date(tu._creationTime).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Origin (Immutable Snapshot)</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-gray-900">{tu.origin_snapshot.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                <p className="text-gray-900 capitalize">{tu.origin_snapshot.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-gray-900">{tu.origin_snapshot.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Signatory</p>
                <p className="text-gray-900">{tu.origin_snapshot.signatory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Declaration Date</p>
                <p className="text-gray-900">{tu.origin_snapshot.declaration_date}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex border-b border-gray-200 mb-4">
              {(['overview', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-emerald-600 text-emerald-700 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-4">Event History</h2>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-400">No events recorded yet.</p>
                ) : (
                  <div className="space-y-0">
                    {history.map((ev, idx) => (
                      <div key={ev._id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            ev.type === 'collection' ? 'bg-emerald-500' :
                            ev.type === 'internal_move' ? 'bg-blue-500' :
                            ev.type === 'split' ? 'bg-purple-500' :
                            ev.type === 'created_from_split' ? 'bg-purple-300' :
                            'bg-amber-500'
                          }`} />
                          {idx < history.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={eventTypeColors[ev.type] ?? 'default'} className="capitalize">{ev.type.replace(/_/g, ' ')}</Badge>
                            <span className="text-xs text-gray-400">{new Date(ev._creationTime).toLocaleString()}</span>
                          </div>
                          {ev.notes && <p className="text-sm text-gray-700">{ev.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && parentTU && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Parent trace unit</p>
                <Link to="/trace-units/$id" params={{ id: parentTU._id }} className="font-mono text-sm text-emerald-700 hover:underline">{parentTU.tu_code}</Link>
                <span className="text-xs text-gray-400 ml-2">{parentTU.mass_kg} kg · {parentTU.status}</span>
              </div>
            )}

            {activeTab === 'overview' && splitChildren.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-3">
                <p className="text-xs text-gray-500 mb-2">Child trace units</p>
                <div className="space-y-1">
                  {splitChildren.map((child) => (
                    <div key={child._id} className="flex items-center gap-2">
                      <Link to="/trace-units/$id" params={{ id: child._id }} className="font-mono text-sm text-emerald-700 hover:underline">{child.tu_code}</Link>
                      <span className="text-xs text-gray-400">{child.mass_kg} kg · {child.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Actions</h2>
            <div className="space-y-2">
              {canEdit && tu.status === 'active' && (
                <button
                  onClick={() => setShowSplit(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm px-3 py-2 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  <Scissors size={15} />
                  Split This Unit
                </button>
              )}
              <Link to="/trace-units/$id/lineage" params={{ id: tu._id }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                <GitBranch size={15} />
                View Lineage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showSplit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSplit(false)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">Split {tu.tu_code}</h2>
              <button onClick={() => setShowSplit(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Current mass: <span className="font-medium text-gray-800">{tu.mass_kg} kg</span>. Two child TUs will be created and this TU will be consumed.
            </p>
            {splitError && <p className="text-xs text-red-600 mb-3">{splitError}</p>}
            <form onSubmit={handleSplit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Split-off amount (kg) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={splitKg}
                  onChange={(e) => setSplitKg(e.target.value)}
                  required
                  min="0.1"
                  max={tu.mass_kg - 0.1}
                  step="0.1"
                  placeholder={`Max ${(tu.mass_kg - 0.1).toFixed(1)} kg`}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {splitKg && parseFloat(splitKg) > 0 && parseFloat(splitKg) < tu.mass_kg && (
                <div className="bg-gray-50 rounded-md p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{tu.tu_code}-C1 (stays here)</span>
                    <span className="font-medium">{(tu.mass_kg - parseFloat(splitKg)).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{tu.tu_code}-C2 (split-off)</span>
                    <span className="font-medium">{parseFloat(splitKg).toFixed(1)} kg</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">Move split-off to asset <span className="text-gray-400">(optional)</span></label>
                <select
                  value={destAssetId}
                  onChange={e => setDestAssetId(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Stay in current asset</option>
                  {availableAssets
                    .filter(a => a._id !== tu.current_asset_id)
                    .map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.current_kg}/{a.capacity_kg} kg)</option>
                    ))
                  }
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-600 text-white text-sm py-2 rounded-md hover:bg-emerald-700 transition-colors">Confirm Split</button>
                <button type="button" onClick={() => setShowSplit(false)} className="px-4 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
