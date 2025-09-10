import { useParams, useNavigate } from 'react-router-dom'
import { SCENARIOS } from '@/features/auri/roleplays/scenarios'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Button } from '@/components/ui/button'

export default function RoleplayRun() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation(['roleplay'])
  const scenario = SCENARIOS.find(x => x.id === id)
  const [step, setStep] = React.useState(0)
  
  if (!scenario) {
    return (
      <div className="p-4">
        <p>Scenario not found</p>
        <Button onClick={() => navigate('/roleplay')}>Back to scenarios</Button>
      </div>
    )
  }
  
  const currentStep = scenario.steps[step]
  const getLocalizedText = (obj: Record<string, string>) => obj[i18n.language] || obj.en || ''
  
  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{getLocalizedText(scenario.title)}</h1>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-muted-foreground">{t('hint', 'Tips')}</div>
        <div className="text-lg">{getLocalizedText(currentStep.goal)}</div>
      </div>
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            {t('prev', 'Tillbaka')}
          </Button>
        )}
        {step < scenario.steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            {t('next', 'Nästa')}
          </Button>
        ) : (
          <Button onClick={() => navigate('/roleplay')}>
            {t('finish', 'Avsluta')}
          </Button>
        )}
      </div>
    </div>
  )
}