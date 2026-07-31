import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/lib/components/Badge'
import { Link } from '@tanstack/react-router'

type BadgeVariant = 'active' | 'transit' | 'quarantine' | 'consumed' | 'expired' | 'default'

const eventTypeColors: Record<string, BadgeVariant> = {
  collection: 'active',
  internal_move: 'transit',
  split: 'default',
  created_from_split: 'default',
  loss: 'consumed',
  external_sale: 'expired',
}

export function AuditLog() {
  const transactions = useQuery(api.transactions.list) ?? []

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Audit Log</h1>
        <span className="text-xs text-gray-400">{transactions.length} events</span>
      </div>
      <div className="p-6">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400">No transactions recorded yet.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Event</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Trace Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {[...transactions].sort((a, b) => b._creationTime - a._creationTime).map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={eventTypeColors[tx.type] ?? 'default'} className="capitalize">
                        {tx.type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">
                      <Link to="/trace-units/$id" params={{ id: tx.tu_id }} className="text-emerald-700 hover:underline">
                        {tx.tu_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{tx.notes || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(tx._creationTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
