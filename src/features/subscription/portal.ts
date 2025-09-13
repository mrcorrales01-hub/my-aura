export async function startPortal() {
  try {
    const base = (import.meta as any).env?.VITE_SUPABASE_URL
    if (!base) throw new Error('no-base')
    
    const { supabase } = await import('@/integrations/supabase/client')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Soft prompt: route to auth/settings
      location.href = '/settings'
      return
    }

    const res = await fetch(`${base}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        return_url: location.origin + '/settings/subscription?portal=1' 
      })
    })

    if (!res.ok) throw new Error('bad-status:' + res.status)
    
    const { url } = await res.json()
    if (!url) throw new Error('no-url')
    
    location.href = url

  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[portal]', e)
    
    // Try to get translation if available
    const errorMsg = (window as any).i18next?.t?.('pricing:portalError') ?? 'Portal error'
    alert(errorMsg)
  }
}