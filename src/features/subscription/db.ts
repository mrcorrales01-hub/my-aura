import { getPlanLocal, setPlanLocal, PlanId } from './plan'

export async function getPlanDb():Promise<{plan:'free'|'plus'|'pro', ok:boolean}>{
  try{
    // Try Supabase if available
    const { supabase } = await import('@/integrations/supabase/client')
    const { data:{ session } } = await supabase.auth.getSession()
    if(!session) return { plan: getPlanLocal(), ok:true }
    
    // Try to get user subscription - handle various table structures
    let r = await supabase.from('subscribers')
      .select('subscribed, subscription_tier')
      .eq('id', session.user.id)
      .maybeSingle()
    
    if(r.error) {
      // Fallback to user_id column if id doesn't work
      r = await supabase.from('subscribers')
        .select('subscribed, subscription_tier') 
        .eq('user_id', session.user.id)
        .maybeSingle()
      if(r.error) return { plan: getPlanLocal(), ok:false }
    }
    
    const data = r.data
    const plan = (data?.subscribed && (data.subscription_tier==='pro'?'pro': data.subscription_tier==='plus'?'plus':'free')) || 'free'
    // sync local for fast gating
    setPlanLocal(plan as any)
    return { plan: plan as any, ok:true }
  }catch{ 
    return { plan: getPlanLocal(), ok:false } 
  }
}

export async function setPlanDb(plan:'free'|'plus'|'pro'){ 
  // Dev fallback only
  try{
    const { supabase } = await import('@/integrations/supabase/client')
    const { data:{ session } } = await supabase.auth.getSession()
    if(!session) { 
      setPlanLocal(plan)
      return 
    }
    
    // Try to update subscribers table with required fields
    const email = session.user.email || 'unknown@example.com'
    await supabase.from('subscribers').upsert({ 
      id: session.user.id,
      email,
      subscribed: plan!=='free', 
      subscription_tier: plan 
    }, { onConflict: 'id' })
    
    setPlanLocal(plan)
  }catch(e){ 
    console.warn('DB sync failed, using localStorage:', e)
    setPlanLocal(plan) 
  }
}