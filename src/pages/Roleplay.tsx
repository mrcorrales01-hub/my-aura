import { listFor } from '@/features/auri/roleplays/scenarios'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function RoleplayPage() {
  const { i18n, t } = useTranslation(['roleplay'])
  const nav = useNavigate()
  const items = listFor(i18n.language)

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{t('title', 'Rollspel')}</h1>
      <p className="text-muted-foreground">{t('subtitle', 'Säkra, guidande övningar')}</p>
      {items.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">{t('noScripts', 'Inga scenarier hittades')}</div>
      ) : (
        <div className="grid gap-3">
          {items.map(it => (
            <button
              key={it.id}
              type="button"
              className="rounded-xl border px-4 py-3 text-left hover:bg-accent"
              onClick={() => nav(`/roleplay/${it.id}`)}
            >
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-muted-foreground">{t('selectScript', 'Välj scenario')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}