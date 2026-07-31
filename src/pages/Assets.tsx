import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/lib/AuthContext'
import { Link } from '@tanstack/react-router'
import { Warehouse, Truck, FlaskConical, AlertTriangle, Plus } from 'lucide-react'

const typeIcon: Record<string, React.ReactNode> = {
  warehouse: <Warehouse size={16} className="text-emerald-700" />,
  processing: <FlaskConical size={16} className="text-blue-700" />,
  quarantine: <AlertTriangle size={16} className="text-red-600" />,
  vehicle: <Truck size={16} className="text-amber-700" />,
}

const typeBg: Record<string, string> = {
  warehouse: 'bg-emerald-100',
  processing: 'bg-blue-100',
  quarantine: 'bg-red-100',
  vehicle: 'bg-amber-100',
}

export function Assets() {
  const { role, orgId } = useAuth()

  const orgAssets = useQuery(api.assets.listByOrg, orgId ? { org_id: orgId } : 'skip')
  const allAssets = useQuery(api.assets.list, role === 'admin' ? {} : 'skip')

  const assets = role === 'admin' ? (allAssets ?? []) : (orgAssets ?? [])
  const isLoading = assets === undefined

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Assets &amp; Storage</h1>
        {role !== 'auditor' && (
          <Link to="/assets/new" className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
            <Plus size={16} />
            New Asset
          </Link>
        )}
      </div>
      <div className="p-6">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="text-sm text-gray-400">No assets found.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {assets.map((asset) => {
              const fillPct = Math.round((asset.current_kg / asset.capacity_kg) * 100)
              const barColor = fillPct > 80 ? 'bg-red-400' : fillPct > 50 ? 'bg-amber-400' : 'bg-emerald-500'
              return (
                <Link key={asset._id} to="/assets/$id" params={{ id: asset._id }} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeBg[asset.type]}`}>
                      {typeIcon[asset.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Capacity</span>
                      <span>{asset.current_kg.toLocaleString()} / {asset.capacity_kg.toLocaleString()} kg</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(fillPct, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{fillPct}% full</p>
                  </div>

                  <div className="text-xs text-gray-500 truncate">{asset.location}</div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
