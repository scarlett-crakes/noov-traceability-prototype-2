import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function CreateOrigin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    type: 'business',
    phone: '',
    signatory: '',
    address: '',
    declaration_date: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate({ to: '/origins' }), 1500)
  }

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-700 text-xl">✓</span>
          </div>
          <p className="text-sm font-medium text-gray-900">Point of Origin created!</p>
          <p className="text-xs text-gray-500 mt-1">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">New Point of Origin</h1>
        <Link to="/origins" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Depositor Details</h2>
            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Burger Joint or Maria Garcia"
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
                  <option value="business">Business</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 213 555 0100"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Signatory <span className="text-red-500">*</span></label>
                <input
                  name="signatory"
                  value={form.signatory}
                  onChange={handleChange}
                  required
                  placeholder="Full name of signing party"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Declaration Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="declaration_date"
                  value={form.declaration_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Address <span className="text-red-500">*</span></label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Street, City, State"
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
              Create Point of Origin
            </button>
            <Link to="/origins" className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
