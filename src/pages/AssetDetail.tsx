import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useParams, Link } from '@tanstack/react-router'
import { StatusBadge } from '@/lib/components/Badge'
import { ArrowLeft, Warehouse, Truck, FlaskConical, AlertTriangle, ArrowUp } from 'lucide-react'
import type { Id } from '../../convex/_generated/dataModel'

const typeIcon: Record<string, React.ReactNode> = {
  warehouse: <Warehouse size={18} className="text-emerald-700" />,
  processing: <FlaskConical size={18} className="text-blue-700" />,
  quarantine: <AlertTriangle size={18} className="text-red-600" />,
  vehicle: <Truck size={18} className="text-amber-700" />,
}

export function AssetDetail() {
  const { id } = useParams({ from: '/app/assets/$id' })
  const asset = useQuery(api.assets.get, { id: id as Id<'assets'> })
  const traceUnits = useQuery(api.traceUnits.listByAsset, { asset_id: id as Id<'assets'> })

  if (asset === undefined || traceUnits === undefined) {
    return <div className="p-6 text-sm text-gray-400">Loading…</div>
  }
  if (asset === null) {
    return <div className="p-6 text-sm text-red-500">Asset not found.</div>
  }

  const activeTUs = traceUnits.filter(tu => tu.status === 'active')
  const fillPct = Math.round((asset.current_kg / asset.capacity_kg) * 100)
  const barColor = fillPct > 80 ? 'bg-red-400' : fillPct > 50 ? 'bg-amber-400' : 'bg-emerald-500'

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {typeIcon[asset.type]}
          <div>
            <h1 className="text-base font-medium text-gray-900">{asset.name}</h1>
            <p className="text-xs text-gray-500 capitalize">{asset.type} · {asset.location}</p>
          </div>
        </div>
        <Link to="/assets" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6 space-y-5">
        {/* Capacity bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Capacity</span>
            <span className="text-gray-900 font-medium">{asset.current_kg.toLocaleString()} / {asset.capacity_kg.toLocaleString()} kg</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(fillPct, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{fillPct}% full · {activeTUs.length} active trace unit{activeTUs.length !== 1 ? 's' : ''}</p>
        </div>

        {/* TUs in this asset */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-gray-900">Trace Units in this asset</h2>
              <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <ArrowUp size={10} />
                FIFO order
              </span>
            </div>
            <span className="text-xs text-gray-400">{traceUnits.length} total</span>
          </div>

          {traceUnits.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No trace units in this asset.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">FIFO</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">TU Code</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Origin</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Mass (kg)</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Collected</th>
                </tr>
              </thead>
              <tbody>
                {traceUnits.map((tu, idx) => (
                  <tr key={tu._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                      {idx === 0 && tu.status === 'active' ? (
                        <span className="text-amber-600 font-medium">→ next</span>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link to="/trace-units/$id" params={{ id: tu._id }} className="font-mono text-emerald-700 hover:underline text-xs">
                        {tu.tu_code}
                      </Link>
                      {tu.parent_tu_id && (
                        <p className="text-xs text-gray-400">child TU</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-xs">{tu.origin_snapshot.name}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{tu.mass_kg}</td>
                    <td className="py-3 px-4"><StatusBadge status={tu.status} /></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(tu._creationTime).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
