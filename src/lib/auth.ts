import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
})

export type UserRole = 'admin' | 'collector' | 'auditor'

export interface DummyUser {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
}

export const DUMMY_USERS: DummyUser[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@tracy.com', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Collector A', email: 'collector@tracy.com', password: 'collector123', role: 'collector' },
  { id: 'u3', name: 'Auditor A', email: 'auditor@tracy.com', password: 'auditor123', role: 'auditor' },
]
