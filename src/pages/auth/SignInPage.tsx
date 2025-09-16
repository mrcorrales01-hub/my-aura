import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

export default function SignInPage(){
  const { t, i18n } = useTranslation('auth')
  const [googleReady, setGoogleReady] = useState(true)
  const [appleReady, setAppleReady] = useState(true)
  const loc = useLocation()

  useEffect(()=>{
    // lightweight provider probe: if env missing, we still try; if it throws, fall back
    try{ 
      new URL("https://rggohnwmajmrvxgfmimk.supabase.co") 
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0"
      if(!anonKey) {
        setGoogleReady(false)
        setAppleReady(false)
      }
    } catch { 
      setGoogleReady(false)
      setAppleReady(false)
    }
  },[])

  // Apple Sign-In Logic
  const handleAppleSignIn = async () => {
    try {
      sessionStorage.setItem('aura.returnTo', '/');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        }
      });
      
      if (error) {
        console.error('Apple sign-in error:', error);
        setAppleReady(false);
      }
    } catch (error) {
      console.error('Apple sign-in failed:', error);
      setAppleReady(false);
    }
  };

  // Google Sign-In Logic
  const handleGoogleSignIn = async ()=>{
    try{
      sessionStorage.setItem('aura.returnTo', '/');
      const redirectTo = `${location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { prompt:'select_account', access_type:'offline' } }
      })
      if (error) throw error
    }catch(e){ console.warn('[oauth]',e); setGoogleReady(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="w-full max-w-md space-y-6 bg-background rounded-xl border p-6 shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          {loc.state?.msg && <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">{String(loc.state.msg)}</div>}
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="space-y-3">
          {/* Apple Sign-In Button */}
          <button
            onClick={handleAppleSignIn}
            disabled={!appleReady}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-colors ${appleReady?'bg-background hover:bg-muted/50 border-border':'bg-muted text-muted-foreground cursor-not-allowed border-muted'}`}
            aria-disabled={!appleReady}
          >
            🍎
            <span className="font-medium">{appleReady ? t('continueApple') : t('appleUnavailable')}</span>
          </button>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={!googleReady}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-colors ${googleReady?'bg-background hover:bg-muted/50 border-border':'bg-muted text-muted-foreground cursor-not-allowed border-muted'}`}
            aria-disabled={!googleReady}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 2.9l5.6-5.6C34.4 3.1 29.5 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c11.9 0 21-8.6 21-22 0-1.4-.1-2.8-.4-4.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.2 18.9 13 24 13c3.1 0 6 1.1 8.2 2.9l5.6-5.6C34.4 3.1 29.5 1 24 1 16 1 8.9 5.2 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.2 36.4 26.7 37 24 37c-5.3 0-9.7-2.9-11.8-7.2l-6.6 5.1C8.2 42.5 15.6 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 2.9l5.6-5.6C34.4 3.1 29.5 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c11.9 0 21-8.6 21-22 0-1.4-.1-2.8-.4-4.5z"/>
            </svg>
            <span className="font-medium">{googleReady ? t('continueGoogle') : t('providerMissing')}</span>
          </button>

          {/* Email Sign-In Button */}
          <Link 
            to="/auth" 
            className="block w-full text-center px-4 py-3 rounded-xl border bg-background hover:bg-muted/50 transition-colors font-medium"
          >
            ✉️ {t('continueEmail')}
          </Link>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline">
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}