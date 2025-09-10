import { SCENARIOS } from '@/features/auri/roleplays/scenarios'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function RoleplayPage() {
  const { i18n, t } = useTranslation(['roleplay'])
  const navigate = useNavigate()

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{t('title', 'Rollspel')}</h1>
      <p className="text-muted-foreground">{t('subtitle', 'Säkra, guidande övningar')}</p>
      {SCENARIOS.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">{t('noScripts', 'Inga scenarier hittades')}</div>
      ) : (
        <div className="grid gap-3">
          {SCENARIOS.map(scenario => {
            const title = scenario.title[i18n.language] || scenario.title.en || scenario.id;
            return (
              <div key={scenario.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{scenario.steps.length} steps</p>
                  </div>
                  <Button onClick={() => navigate(`/roleplay/${scenario.id}`)}>
                    {t('selectScript', 'Välj scenario')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}