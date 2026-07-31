import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/lib/components/Badge'
import { useAuth } from '@/lib/AuthContext'
import { Plus, X } from 'lucide-react'

const emptyForm = { name: '', type: 'collector', contact_email: '', cert_number: '', cert_expiry: '', cert_status: 'ACTIVE' }

export function Actors() {
  const { role } = useAuth()
  const orgs = useQuery(api.organizations.list) ?? []
  const createOrg = useMutation(api.organizations.create)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const canAdmin = role === 'admin'

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createOrg({
        name: form.name,
        type: form.type as any,
        contact_email: form.contact_email,
        cert_number: form.cert_number || undefined,
        cert_expiry: form.cert_expiry || undefined,
        cert_status: form.cert_status ? (form.cert_status as 'ACTIVE' | 'EXPIRED') : undefined,
      })
      setForm(emptyForm)
      setShowModal(false)
    } catch (err: any) {
      setError(err.message ?? 'Failed to create organization')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Organizations</h1>
        {canAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} />
            New Organization
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {orgs.length === 0 ? (
          <p className="text-sm text-gray-400">No organizations yet.</p>
        ) : (
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
                {orgs.map((org) => (
                  <tr key={org._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{org.name}</td>
                    <td className="py-3 px-4 text-gray-500 capitalize">{org.type}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{org.contact_email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={org.is_active ? 'active' : 'consumed'}>{org.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{org.cert_number || '—'}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{org.cert_expiry ? new Date(org.cert_expiry).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      {org.cert_status === 'ACTIVE' && <Badge variant="active">Active</Badge>}
                      {org.cert_status === 'EXPIRED' && <Badge variant="expired">Expired</Badge>}
                      {!org.cert_status && <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-gray-900">New Organization</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Organization Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Acme UCO Collectors"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Type <span className="text-red-500">*</span></label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="collector">Collector</option>
                    <option value="auditor">Auditor</option>
                    <option value="trader">Trader</option>
                    <option value="processor">Processor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Contact Email <span className="text-red-500">*</span></label>
                  <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} required placeholder="ops@org.com"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-3">ISCC Certification (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Cert Number</label>
                    <input name="cert_number" value={form.cert_number} onChange={handleChange} placeholder="ISCC-EU-2024-..."
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Expiry Date</label>
                    <input type="date" name="cert_expiry" value={form.cert_expiry} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Cert Status</label>
                    <select name="cert_status" value={form.cert_status} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-emerald-600 text-white text-sm py-2 rounded-md hover:bg-emerald-700 transition-colors">
                  Create Organization
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
