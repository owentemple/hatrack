import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasLocalData } from '../lib/localStore'
import { ReactNode } from 'react'

export default function ProtectedRoute({ children, requireAuth }: { children: ReactNode; requireAuth?: boolean }) {
  const { user, loading } = useAuth()

  if (loading) return null

  // Settings requires a real account; other protected routes allow anonymous with local data
  if (!user) {
    if (requireAuth || !hasLocalData()) return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
