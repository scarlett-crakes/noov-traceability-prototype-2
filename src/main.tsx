import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AuthProvider } from './lib/AuthContext'
import { router } from './routes/index'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConvexProvider>
  </StrictMode>,
)
