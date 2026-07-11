import { useState } from 'react'
import { dummyTraceUnits } from '@/data/dummy'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Lock, GitBranch, Scissors, X } from 'lucide-react'
import { StatusBadge, Badge } from '@/lib/components/Badge'
import { useAuth } from '@/lib/AuthContext'

const eventTypeColors: Record<string, 'active' | 'transit' | 'quarantine' | 'consumed' | 'default'> = {
  collection: 'active',
  transfer: 'transit',
  split: 'default',
  quarantine: 'quarantine',
  loss: 'consumed',
}

export function TraceUnitDetail() {
  const { id } = useParams({ from: '/app/trace-units/$id' })
  const { role } = useAuth()
  const tu = dummyTraceUnits.find((t) => t.id === id)
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [showSplit, setShowSplit] = useState(false)
  const [splitKg, setSplitKg] = useState('')
  const [splitDone, setSplitDone] = useState(false)

  const canEdit = role === 'admin' || role === 'collector'

  if (!tu) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-red-600 text-sm">Trace unit not found.</p>
          <Link to="/inventory" className="text-sm text-emerald-700 underline mt-3 inline-block">Back to Inventory</Link>
        </div>
      </div>
    )
  }

  const history = (tu as any).history ?? []
  const parentTu = (tu as any).parent_tu_id ? dummyTraceUnits.find((t) => t.id === (tu as any).parent_tu_id) : null
  const splitChildren = dummyTraceUnits.filter((t) => (t as any).parent_tu_id === tu.id)

  function handleSplit(e: React.FormEvent) {
    e.preventDefault()
    setSplitDone(true)
    setShowSplit(false)
    setSplitKg('')
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium text-gray-900 font-mono">{tu.id}</h1>
          {(tu as any).parent_tu_id && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              split from {(tu as any).parent_tu_id}
            </span>
          )}
        </div>
        <Link to="/inventory" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {splitDone && (
        <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800">
          Split recorded — new TU <span className="font-mono">{tu.id}-S{splitChildren.length + 1}</span> created with {splitKg || '?'} kg. (Dummy mode: refresh inventory to see updated list.)
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
                <p className="text-xs text-gray-500 mb-0.5">Current Owner</p>
                <p className="text-gray-900">{tu.current_owner}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Location</p>
                <p className="text-gray-900">{tu.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created</p>
                <p className="text-gray-900">{new Date(tu.created).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Origin (Immutable)</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-gray-900">{tu.origin.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                <p className="text-gray-900 capitalize">{tu.origin.type}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
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
                    {history.map((ev: any, idx: number) => (
                      <div key={ev.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            ev.type === 'collection' ? 'bg-emerald-500' :
                            ev.type === 'transfer' ? 'bg-blue-500' :
                            ev.type === 'split' ? 'bg-purple-500' :
                            'bg-amber-500'
                          }`} />
                          {idx < history.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={eventTypeColors[ev.type] ?? 'default'} className="capitalize">{ev.type}</Badge>
                            <span className="text-xs text-gray-400">{new Date(ev.created).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-700">{ev.notes}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ev.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && parentTu && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Parent trace unit</p>
                <Link to="/trace-units/$id" params={{ id: parentTu.id }} className="font-mono text-sm text-emerald-700 hover:underline">{parentTu.id}</Link>
                <span className="text-xs text-gray-400 ml-2">{parentTu.mass_kg} kg · {parentTu.status}</span>
              </div>
            )}

            {activeTab === 'overview' && splitChildren.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-3">
                <p className="text-xs text-gray-500 mb-2">Split into</p>
                <div className="space-y-1">
                  {splitChildren.map((child) => (
                    <div key={child.id} className="flex items-center gap-2">
                      <Link to="/trace-units/$id" params={{ id: child.id }} className="font-mono text-sm text-emerald-700 hover:underline">{child.id}</Link>
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
              <Link to="/trace-units/$id/lineage" params={{ id: tu.id }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                <GitBranch size={15} />
                View Lineage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Split modal */}
      {showSplit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSplit(false)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">Split {tu.id}</h2>
              <button onClick={() => setShowSplit(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Current mass: <span className="font-medium text-gray-800">{tu.mass_kg} kg</span>. The split-off portion becomes a new TU. The remainder keeps this ID.
            </p>
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
                    <span className="text-gray-500">{tu.id} (remainder)</span>
                    <span className="font-medium">{(tu.mass_kg - parseFloat(splitKg)).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{tu.id}-S{splitChildren.length + 1} (new)</span>
                    <span className="font-medium">{parseFloat(splitKg).toFixed(1)} kg</span>
                  </div>
                </div>
              )}
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
