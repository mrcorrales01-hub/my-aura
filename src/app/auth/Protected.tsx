import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export function Protected({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const { t } = useTranslation('auth')
  const loc = useLocation()
  
  if (loading) return <div className="p-6">…</div>
  
  if (!session) {
    sessionStorage.setItem('aura.returnTo', loc.pathname + loc.search)
    return <Navigate to="/auth/signin" replace state={{ msg: t('requireLogin') }} />
  }
  
  return <>{children}</>
}