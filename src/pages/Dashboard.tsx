import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/lib/AuthContext'
import { StatusBadge } from '@/lib/components/Badge'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export function Dashboard() {
  const { role, orgId } = useAuth()

  const orgTUs = useQuery(api.traceUnits.listByOrg, orgId ? { org_id: orgId } : 'skip')
  const allTUs = useQuery(api.traceUnits.list, role === 'admin' ? {} : 'skip')
  const traceUnits = role === 'admin' ? (allTUs ?? []) : (orgTUs ?? [])

  const activeTUs = traceUnits.filter(tu => tu.status === 'active')
  const inTransitTUs = traceUnits.filter(tu => tu.status === 'in_transit')
  const quarantineTUs = traceUnits.filter(tu => tu.status === 'quarantine')
  const totalMass = activeTUs.reduce((sum, tu) => sum + tu.mass_kg, 0)

  const recentTUs = [...traceUnits].sort((a, b) => b._creationTime - a._creationTime).slice(0, 4)

  const metrics = [
    { label: 'Active TUs', value: activeTUs.length, sub: 'Currently tracked', color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Total Mass (kg)', value: totalMass.toLocaleString(), sub: 'UCO tracked', color: 'text-emerald-700 bg-emerald-50' },
    { label: 'In Transit', value: inTransitTUs.length, sub: 'Pending custody', color: 'text-amber-700 bg-amber-50' },
    { label: 'Quarantined', value: quarantineTUs.length, sub: 'Needs review', color: 'text-red-700 bg-red-50' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Dashboard</h1>
        {role !== 'auditor' && (
          <Link to="/trace-units/new" className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
            <Plus size={16} />
            New Trace Unit
          </Link>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-medium text-gray-900">{m.value}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 ${m.color}`}>{m.sub}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Recent trace units</h2>
          {recentTUs.length === 0 ? (
            <p className="text-xs text-gray-400">No trace units yet.</p>
          ) : (
            <div className="space-y-0">
              {recentTUs.map((tu) => (
                <div key={tu._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <Link to="/trace-units/$id" params={{ id: tu._id }} className="text-sm font-medium text-emerald-700 font-mono hover:underline">{tu.tu_code}</Link>
                    <p className="text-xs text-gray-500">{tu.origin_snapshot.name} · {tu.mass_kg} kg</p>
                  </div>
                  <StatusBadge status={tu.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
