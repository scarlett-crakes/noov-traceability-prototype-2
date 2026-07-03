import { dummyTraceUnits } from '@/data/dummy'
import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Lock, GitBranch } from 'lucide-react'
import { StatusBadge } from '@/lib/components/Badge'

export function TraceUnitDetail() {
  const { id } = useParams({ from: '/app/trace-units/$id' })
  const tu = dummyTraceUnits.find((t) => t.id === id)

  if (!tu) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-red-600 text-sm">Trace unit not found.</p>
          <Link to="/inventory" className="text-sm text-emerald-700 underline mt-3 inline-block">Back to Inventory</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900 font-mono">{tu.id}</h1>
        <Link to="/inventory" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Current State</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mass</p>
                <p className="text-lg font-medium text-gray-900">{tu.mass_kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <StatusBadge status={tu.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Product Type</p>
                <p className="text-gray-900">{tu.product_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Current Owner</p>
                <p className="text-gray-900">{tu.current_owner}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Location</p>
                <p className="text-gray-900">{tu.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created</p>
                <p className="text-gray-900">{new Date(tu.created).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">Origin (Immutable)</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-gray-900">{tu.origin.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                <p className="text-gray-900 capitalize">{tu.origin.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Actions</h2>
            <div className="space-y-2">
              <Link to="/trace-units/$id/lineage" params={{ id: tu.id }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                <GitBranch size={15} />
                View Lineage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
