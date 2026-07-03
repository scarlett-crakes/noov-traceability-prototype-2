import { dummyTraceUnits, dummyEvents } from '@/data/dummy'
import { StatusBadge } from '@/lib/components/Badge'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

const metrics = [
  { label: 'Active TUs', value: 142, sub: '+12 this week', color: 'text-emerald-700 bg-emerald-50' },
  { label: 'Total Mass (kg)', value: '8,430', sub: 'UCO tracked', color: 'text-emerald-700 bg-emerald-50' },
  { label: 'In Transit', value: 23, sub: 'Pending custody', color: 'text-amber-700 bg-amber-50' },
  { label: 'Quarantined', value: 4, sub: 'Needs review', color: 'text-red-700 bg-red-50' },
]

const eventTypeLabel: Record<string, string> = {
  collection: 'Collected',
  transfer: 'Transferred',
  split: 'Split',
  quarantine: 'Quarantined',
}

export function Dashboard() {
  const { role } = useAuth()
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

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Recent trace units</h2>
            <div className="space-y-0">
              {dummyTraceUnits.slice(0, 4).map((tu) => (
                <div key={tu.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{tu.id}</p>
                    <p className="text-xs text-gray-500">{tu.origin.name} · {tu.mass_kg} kg</p>
                  </div>
                  <StatusBadge status={tu.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Recent events</h2>
            <div className="space-y-0">
              {dummyEvents.map((ev) => {
                const dotColor = ev.type === 'transfer' ? 'bg-blue-500' : ev.type === 'quarantine' ? 'bg-amber-500' : 'bg-emerald-500'
                return (
                  <div key={ev.id} className="flex gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                    <div>
                      <p className="text-sm text-gray-900">{eventTypeLabel[ev.type]} {ev.tu_id}</p>
                      <p className="text-xs text-gray-500">{new Date(ev.created).toLocaleString()} · {ev.actor}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
