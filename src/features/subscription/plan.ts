export type PlanId = 'free'|'plus'|'pro'

export const PLAN_LIMITS = {
  free: { auriDaily: 20 },
  plus: { auriDaily: 200 },
  pro:  { auriDaily: 9999 }
} as const

export function getPlanLocal(): PlanId {
  try{
    const v = localStorage.getItem('aura.plan') as PlanId|null
    return (v==='plus'||v==='pro') ? v : 'free'
  }catch{return 'free'}
}

export function setPlanLocal(p:PlanId){ 
  localStorage.setItem('aura.plan', p) 
}

const USE_KEY_PREFIX='aura.usage.'

export function getUsageToday(){
  const key = USE_KEY_PREFIX + new Date().toISOString().slice(0,10)
  try{ 
    return JSON.parse(localStorage.getItem(key)||'{"auri":0}') 
  }catch{ 
    return {auri:0} 
  }
}

export function incAuriUse(){
  const key = USE_KEY_PREFIX + new Date().toISOString().slice(0,10)
  const v = getUsageToday()
  v.auri = (v.auri||0)+1
  localStorage.setItem(key, JSON.stringify(v))
  return v.auri
}

export function canUseAuri(plan:PlanId){
  const used = getUsageToday().auri||0
  const limit = PLAN_LIMITS[plan].auriDaily
  return used < limit
}