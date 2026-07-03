import { dummyOrigins } from '@/data/dummy'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Lock } from 'lucide-react'

export function OriginDetail() {
  const { id } = useParams({ from: '/app/origins/$id' })
  const origin = dummyOrigins.find((o) => o.id === id)

  if (!origin) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-red-600 text-sm">Point of origin not found.</p>
          <Link to="/origins" className="text-sm text-emerald-700 underline mt-3 inline-block">Back to Origins</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">{origin.name}</h1>
        <Link to="/origins" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={15} className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-900">Origin Details (Immutable)</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Name</p>
              <p className="text-gray-900">{origin.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Type</p>
              <p className="text-gray-900 capitalize">{origin.type || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Phone</p>
              <p className="text-gray-900">{origin.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Signatory</p>
              <p className="text-gray-900">{origin.signatory || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Declaration Date</p>
              <p className="text-gray-900">{origin.declaration_date ? new Date(origin.declaration_date).toLocaleDateString() : '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Address</p>
              <p className="text-gray-900">{origin.address || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
