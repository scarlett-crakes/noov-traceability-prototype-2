import { dummyEvents } from '@/data/dummy'
import { Badge } from '@/lib/components/Badge'

const eventTypeColors: Record<string, BadgeVariant> = {
  collection: 'active',
  transfer: 'transit',
  split: 'default',
  quarantine: 'quarantine',
}

type BadgeVariant = 'active' | 'transit' | 'quarantine' | 'consumed' | 'expired' | 'default'

export function AuditLog() {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Audit Log</h1>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Event</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Trace Unit</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Actor</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {dummyEvents.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant={eventTypeColors[ev.type] ?? 'default'} className="capitalize">{ev.type}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">{ev.tu_id}</td>
                  <td className="py-3 px-4 text-gray-700">{ev.actor}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{ev.notes}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(ev.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
