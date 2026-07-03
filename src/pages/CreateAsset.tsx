import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function CreateAsset() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    type: 'warehouse',
    location: '',
    capacity_kg: '',
    manager: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate({ to: '/assets' }), 1500)
  }

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-700 text-xl">✓</span>
          </div>
          <p className="text-sm font-medium text-gray-900">Asset created!</p>
          <p className="text-xs text-gray-500 mt-1">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">New Asset</h1>
        <Link to="/assets" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Asset Details</h2>
            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Warehouse C or Collection Vehicle 02"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Type <span className="text-red-500">*</span></label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="warehouse">Warehouse</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="processing">Processing Plant</option>
                  <option value="quarantine">Quarantine Bay</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Capacity (kg) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="capacity_kg"
                  value={form.capacity_kg}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Location <span className="text-red-500">*</span></label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Street address or description"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Manager / Owner</label>
                <input
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  placeholder="e.g. UCO Collectors Inc"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              Create Asset
            </button>
            <Link to="/assets" className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
