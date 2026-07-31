import { createAuthClient } from 'better-auth/react'

// Both dev (Vite proxy) and prod (Pages Function) serve /api/auth from the same origin,
// so we can always use window.location.origin.
const authBaseURL = typeof window !== 'undefined' ? window.location.origin : ''

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  basePath: '/api/auth',
  fetchOptions: { credentials: 'include' },
})

export type UserRole = 'admin' | 'collector' | 'auditor'

// Kept for the Login page demo-fill buttons only (passwords shown in UI)
export const DEMO_ACCOUNTS = [
  { name: 'Admin User', email: 'admin@tracy.com', password: 'admin123', role: 'admin' as UserRole },
  { name: 'Collector A', email: 'collector@tracy.com', password: 'collector123', role: 'collector' as UserRole },
  { name: 'Auditor A', email: 'auditor@tracy.com', password: 'auditor123', role: 'auditor' as UserRole },
]
