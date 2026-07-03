import { dummyOrigins } from '@/data/dummy'
import { Link } from '@tanstack/react-router'
import { Plus, MapPin } from 'lucide-react'


export function Origins() {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Points of Origin</h1>
        <Link to="/origins/new" className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors">
          <Plus size={16} />
          New PoO
        </Link>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {dummyOrigins.map((origin) => (
            <Link key={origin.id} to="/origins/$id" params={{ id: origin.id }} className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{origin.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{origin.type}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {origin.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="text-gray-800">{origin.phone}</span>
                  </div>
                )}
                {origin.signatory && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signatory</span>
                    <span className="text-gray-800">{origin.signatory}</span>
                  </div>
                )}
                {origin.declaration_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Declared</span>
                    <span className="text-gray-800">{new Date(origin.declaration_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
