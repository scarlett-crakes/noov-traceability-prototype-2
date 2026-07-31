import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Leaf } from 'lucide-react'
import { DEMO_ACCOUNTS } from '@/lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate({ to: '/' })
    }
  }

  function fillUser(u: typeof DEMO_ACCOUNTS[0]) {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 leading-tight">Tracy</p>
            <p className="text-xs text-gray-500">by Noovoleum</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-sm font-medium text-gray-900 mb-5">Sign in to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@tracy.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white text-sm py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Demo accounts</p>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => fillUser(u)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-700">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
