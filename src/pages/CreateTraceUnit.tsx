import { useState, useRef } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, X, Camera } from 'lucide-react'
import { dummyOrigins } from '@/data/dummy'
import { dummyAssets } from '@/data/assets'

export function CreateTraceUnit() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    origin_id: '',
    asset_id: '',
    mass_kg: '',
    product_type: 'UCO',
    notes: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate({ to: '/inventory' }), 1500)
  }

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-700 text-xl">✓</span>
          </div>
          <p className="text-sm font-medium text-gray-900">Trace unit created!</p>
          <p className="text-xs text-gray-500 mt-1">Redirecting to inventory…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">New Trace Unit</h1>
        <Link to="/inventory" className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">UCO Photo</h2>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="UCO preview" className="max-h-48 rounded-lg mx-auto" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null) }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Camera size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Click to upload a photo of the UCO</p>
                  <p className="text-xs mt-1">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="hidden"
            />
            {imageFile && <p className="text-xs text-gray-500 mt-2">{imageFile.name}</p>}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Collection Details</h2>
            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Point of Origin <span className="text-red-500">*</span></label>
                <select
                  name="origin_id"
                  value={form.origin_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select origin…</option>
                  {dummyOrigins.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Mass (kg) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="mass_kg"
                  value={form.mass_kg}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 48.5"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Product Type</label>
                <select
                  name="product_type"
                  value={form.product_type}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UCO">UCO (Used Cooking Oil)</option>
                  <option value="Animal Fat">Animal Fat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Storage Asset <span className="text-red-500">*</span></label>
                <select
                  name="asset_id"
                  value={form.asset_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select storage location…</option>
                  {dummyAssets.filter((a) => a.type !== 'quarantine').map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.current_kg}/{a.capacity_kg} kg)</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any observations about this collection…"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              Create Trace Unit
            </button>
            <Link
              to="/inventory"
              className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
