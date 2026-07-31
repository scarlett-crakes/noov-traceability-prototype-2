import { createContext, useContext } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { authClient } from './auth'
import type { Id } from '../../convex/_generated/dataModel'
import type { UserRole } from './auth'

export interface ConvexUser {
  _id: Id<'users'>
  name: string
  email: string
  role: UserRole
  org_id?: Id<'organizations'>
  org?: { _id: Id<'organizations'>; name: string; type: string } | null
}

interface AuthContextValue {
  user: ConvexUser | null
  role: UserRole | null
  orgId: Id<'organizations'> | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  // Look up our Convex user (with role + org) by the authenticated email
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : 'skip',
  ) as ConvexUser | null | undefined

  async function login(email: string, password: string) {
    const res = await authClient.signIn.email({ email, password })
    if (res.error) return { error: res.error.message ?? 'Sign-in failed' }
    return {}
  }

  async function logout() {
    await authClient.signOut()
  }

  // isLoading: session still resolving, OR session exists but Convex user not yet fetched
  const isLoading = isPending || (!!session && convexUser === undefined)
  const user = session ? (convexUser ?? null) : null
  const orgId = user?.org_id ?? null

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, orgId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
