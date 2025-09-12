import { getPlanLocal, canUseAuri, incAuriUse } from './plan'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function useAuriGate(){
  const nav = useNavigate()
  const { t } = useTranslation('pricing')
  
  return {
    beforeSend(){ 
      const p = getPlanLocal()
      if(canUseAuri(p)) { 
        const used = incAuriUse()
        return { allowed:true, used } 
      }
      // show modal & suggest upgrade
      const el = document.getElementById('aura-paywall')
      el?.classList.remove('hidden')
      return { allowed:false }
    },
    PaywallModal: ()=>(
      <div id="aura-paywall" className="hidden fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50">
        <div className="bg-card w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl p-4 space-y-3 shadow-xl border">
          <div className="text-lg font-semibold text-foreground">{t('limitHit')}</div>
          <p className="text-sm text-muted-foreground">{t('limitExplain')}</p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors" 
              onClick={()=>document.getElementById('aura-paywall')?.classList.add('hidden')}
            >
              {t('ok')}
            </button>
            <button 
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
              onClick={()=>{
                document.getElementById('aura-paywall')?.classList.add('hidden')
                nav('/pricing')
              }}
            >
              {t('seePlans')}
            </button>
          </div>
        </div>
      </div>
    )
  }
}