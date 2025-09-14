import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function OAuthCallbackPage(){
  const nav = useNavigate()
  const { t } = useTranslation('auth')
  
  useEffect(()=>{
    (async()=>{
      try{
        // completes PKCE flow on this URL
        await supabase.auth.exchangeCodeForSession(window.location.href)
      }catch(e){ console.warn('[exchange]', e) }
      const back = sessionStorage.getItem('aura.returnTo') || '/'
      sessionStorage.removeItem('aura.returnTo')
      nav(back, { replace:true })
    })()
  },[nav])
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground">{t('callback')}</p>
      </div>
    </div>
  )
}