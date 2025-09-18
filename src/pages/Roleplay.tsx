import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuthContext } from '@/contexts/AuthContext'

import { Json } from '@/integrations/supabase/types'

interface RoleplayScript {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  steps: Json;
}

export default function RoleplayPage() {
  const { t, i18n } = useTranslation(['roleplay', 'common'])
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [scripts, setScripts] = useState<RoleplayScript[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const { data, error } = await supabase
          .from('roleplay_scripts')
          .select('id, slug, title, description, language, steps')
          .eq('is_active', true)
          .eq('language', i18n.language || 'sv')
          .order('title')

        if (error) {
          console.error('Error fetching roleplay scripts:', error)
        } else {
          setScripts(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScripts()
  }, [i18n.language])

  if (!user) {
    return (
      <div className="space-y-4 p-4 pb-24">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Logga in för rollspel</h1>
          <Button onClick={() => navigate('/auth')}>
            Logga in
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{t('roleplay:title', 'Rollspel')}</h1>
      <p className="text-muted-foreground">{t('roleplay:subtitle', 'Öva svåra samtal – stegvis')}</p>
      
      {loading ? (
        <div className="rounded-xl border p-6 text-center">Laddar...</div>
      ) : scripts.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">
          <p className="mb-4">{t('roleplay:noScripts', 'Inga manus ännu')}</p>
          <Button onClick={() => window.location.reload()}>
            Ladda manus
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {scripts.map(script => (
            <Card key={script.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{script.title}</h3>
                  <p className="text-sm text-muted-foreground">{script.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Array.isArray(script.steps) ? script.steps.length : 0} steg
                  </p>
                </div>
                <Button onClick={() => navigate(`/roleplay/${script.slug}`)}>
                  {t('common:start', 'Starta')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}