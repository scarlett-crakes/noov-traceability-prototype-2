import { dummyActors } from '@/data/dummy'
import { Badge } from '@/lib/components/Badge'
import { Plus } from 'lucide-react'

export function Actors() {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Actors</h1>
        <button className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
          <Plus size={16} />
          New Actor
        </button>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">ISCC Cert</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Cert Expiry</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Cert Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyActors.map((actor) => (
                <tr key={actor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{actor.name}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{actor.type}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{actor.contact_email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={actor.is_active ? 'active' : 'consumed'}>{actor.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{actor.cert_number || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{actor.cert_expiry ? new Date(actor.cert_expiry).toLocaleDateString() : '—'}</td>
                  <td className="py-3 px-4">
                    {actor.cert_status === 'ACTIVE' && <Badge variant="active">Active</Badge>}
                    {actor.cert_status === 'EXPIRED' && <Badge variant="expired">Expired</Badge>}
                    {!actor.cert_status && <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
