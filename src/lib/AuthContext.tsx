import { createContext, useContext, useState, useEffect } from 'react'
import type { DummyUser, UserRole } from './auth'
import { DUMMY_USERS } from './auth'

interface AuthContextValue {
  user: DummyUser | null
  role: UserRole | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'tracy_user_id'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (savedId) {
      const found = DUMMY_USERS.find((u) => u.id === savedId) ?? null
      setUser(found)
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const found = DUMMY_USERS.find((u) => u.email === email && u.password === password)
    if (!found) return { error: 'Invalid email or password' }
    setUser(found)
    localStorage.setItem(STORAGE_KEY, found.id)
    return {}
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
