import { dummyTraceUnits } from '@/data/dummy'
import { StatusBadge } from '@/lib/components/Badge'
import { Link } from '@tanstack/react-router'
import { Plus, ArrowUp } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

// FIFO: sort by created date ascending — oldest first
const fifoUnits = [...dummyTraceUnits].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())

export function Inventory() {
  const { role } = useAuth()

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium text-gray-900">Inventory</h1>
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <ArrowUp size={11} />
            FIFO order
          </span>
        </div>
        {role !== 'auditor' && (
          <Link to="/trace-units/new" className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
            <Plus size={16} />
            New Trace Unit
          </Link>
        )}
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">FIFO</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Origin</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Mass (kg)</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody>
              {fifoUnits.map((tu, idx) => (
                <tr key={tu.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-xs text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <Link to="/trace-units/$id" params={{ id: tu.id }} className="font-mono text-emerald-700 hover:underline text-xs">{tu.id}</Link>
                    {'parent_tu_id' in tu && tu.parent_tu_id && (
                      <p className="text-xs text-gray-400">split from {tu.parent_tu_id}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{tu.origin.name}</td>
                  <td className="py-3 px-4 text-gray-700">{tu.mass_kg}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{tu.current_owner}</td>
                  <td className="py-3 px-4"><StatusBadge status={tu.status} /></td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(tu.created).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
