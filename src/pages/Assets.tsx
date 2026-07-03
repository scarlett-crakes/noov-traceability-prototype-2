import { dummyAssets } from '@/data/assets'
import { Badge } from '@/lib/components/Badge'
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
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Assets &amp; Storage</h1>
        <Link to="/assets/new" className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
          <Plus size={16} />
          New Asset
        </Link>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {dummyAssets.map((asset) => {
            const fillPct = Math.round((asset.current_kg / asset.capacity_kg) * 100)
            const barColor = fillPct > 80 ? 'bg-red-400' : fillPct > 50 ? 'bg-amber-400' : 'bg-emerald-500'
            return (
              <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeBg[asset.type]}`}>
                    {typeIcon[asset.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                  </div>
                  <Badge variant="active">Active</Badge>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Capacity</span>
                    <span>{asset.current_kg.toLocaleString()} / {asset.capacity_kg.toLocaleString()} kg</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${fillPct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{fillPct}% full</p>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Manager</span>
                    <span className="text-gray-700 truncate ml-2">{asset.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-700 truncate ml-2 max-w-[150px]">{asset.location}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
