import { useParams } from 'react-router-dom'
import { SCENARIOS } from '@/features/auri/roleplays/scenarios'
import { useTranslation } from 'react-i18next'
import React from 'react'

export default function RoleplayRun() {
  const { id } = useParams()
  const { i18n, t } = useTranslation(['roleplay'])
  const s = SCENARIOS.find(x => x.id === id)
  const [step, setStep] = React.useState(0)
  
  if (!s) return <div className="p-4">Not found</div>
  
  const cur = s.steps[step]
  const txt = (o: Record<string, string>) => o[i18n.language] || o.en
  
  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{txt(s.title as any)}</h1>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">{t('hint', 'Tips')}</div>
        <div className="text-lg">{txt(cur.goal)}</div>
      </div>
      <div className="flex gap-2">
        {step > 0 && (
          <button className="btn" onClick={() => setStep(step - 1)}>
            {t('prev', 'Tillbaka')}
          </button>
        )}
        {step < s.steps.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {t('next', 'Nästa')}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => alert(t('finish', 'Avsluta'))}>
            {t('finish', 'Avsluta')}
          </button>
        )}
      </div>
    </div>
  )
}