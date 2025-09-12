export async function startCheckout(plan:'plus'|'pro'){
  const pk = import.meta.env.VITE_STRIPE_PK
  const price = plan==='pro' ? import.meta.env.VITE_STRIPE_PRICE_PRO : import.meta.env.VITE_STRIPE_PRICE_PLUS
  
  if(!pk || !price){
    // DEV fallback: simulate upgrade instantly
    const { setPlanDb } = await import('./db')
    await setPlanDb(plan)
    return { simulated:true }
  }
  
  // Try Edge Function if exists
  try{
    const base = import.meta.env.VITE_SUPABASE_URL
    const { supabase } = await import('@/integrations/supabase/client')
    const { data:{ session } } = await supabase.auth.getSession()
    
    const res = await fetch(`${base}/functions/v1/create-checkout-session`, {
      method:'POST',
      headers:{ 
        'Content-Type':'application/json', 
        'Authorization':`Bearer ${session?.access_token||''}` 
      },
      body: JSON.stringify({ 
        priceId: price, 
        success_url: location.origin + '/settings/subscription?success=1', 
        cancel_url: location.origin + '/pricing?cancel=1' 
      })
    })
    
    if(!res.ok){ 
      throw new Error('edge-fn-fail') 
    }
    
    const { url } = await res.json()
    location.href = url
    return {}
  }catch{
    // Direct Stripe.js fallback (client-only) – only if pk exists; otherwise we already simulated above
    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(pk)
      if(!stripe){ 
        const { setPlanDb } = await import('./db')
        await setPlanDb(plan)
        return { simulated:true } 
      }
      
      await stripe.redirectToCheckout({ 
        lineItems:[{ price, quantity:1 }], 
        mode:'subscription', 
        successUrl: location.origin + '/settings/subscription?success=1', 
        cancelUrl: location.origin + '/pricing?cancel=1' 
      })
      return {}
    } catch {
      // Final fallback
      const { setPlanDb } = await import('./db')
      await setPlanDb(plan)
      return { simulated:true }
    }
  }
}