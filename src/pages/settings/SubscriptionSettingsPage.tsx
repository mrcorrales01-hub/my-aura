import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Crown, Zap, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanDb, setPlanDb } from '@/features/subscription/db'
import { PlanId, getUsageToday } from '@/features/subscription/plan'
import { useToast } from '@/hooks/use-toast'

const SubscriptionSettingsPage = () => {
  const { t } = useTranslation('pricing')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free')
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState({ auri: 0 })

  useEffect(() => {
    getPlanDb().then(({ plan }) => setCurrentPlan(plan))
    setUsage(getUsageToday())
    
    // Show success toast if coming from successful checkout
    if (searchParams.get('success')) {
      toast({
        title: t('saved'),
        description: 'Din plan har uppdaterats!',
      })
    }
  }, [searchParams, toast, t])

  const handleDowngrade = async () => {
    setLoading(true)
    try {
      await setPlanDb('free')
      setCurrentPlan('free')
      toast({
        title: t('saved'),
        description: 'Din plan har ändrats till Gratis.',
      })
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Kunde inte ändra plan. Försök igen.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till inställningar
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('signedOut')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planConfig = {
    free: { name: t('free'), icon: Gift, color: 'text-muted-foreground' },
    plus: { name: t('plus'), icon: Zap, color: 'text-primary' },
    pro: { name: t('pro'), icon: Crown, color: 'text-amber-600' }
  }

  const config = planConfig[currentPlan]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/settings')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tillbaka till inställningar
      </Button>

      {/* Show real payment status */}
      {import.meta.env.VITE_STRIPE_PK && 
       import.meta.env.VITE_STRIPE_PRICE_PLUS && 
       import.meta.env.VITE_STRIPE_PRICE_PRO && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✓ Riktig betalning aktiv (Stripe konfigurerad)
          </p>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <config.icon className={`w-6 h-6 ${config.color}`} />
              {t('billing')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Aktiv plan</h3>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {config.name}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Användning idag</h3>
              <p className="text-sm text-muted-foreground">
                Auri-meddelanden: {usage.auri} av{' '}
                {currentPlan === 'free' ? '20' : currentPlan === 'plus' ? '200' : 'obegränsat'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate('/pricing')}
                variant="outline"
              >
                {t('changePlan')}
              </Button>
              
              {currentPlan !== 'free' && (
                <Button
                  onClick={handleDowngrade}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Ändrar...' : t('downgrade')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plandetaljer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Auri-meddelanden per dag</span>
                <span className="font-medium">
                  {currentPlan === 'free' ? '20' : currentPlan === 'plus' ? '200' : 'Obegränsat'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rollspel & Studio</span>
                <span className="font-medium">✓ Ingår</span>
              </div>
              <div className="flex justify-between">
                <span>Coach Cards & Mini-coach</span>
                <span className="font-medium">✓ Ingår</span>
              </div>
              <div className="flex justify-between">
                <span>PDF-export & delning</span>
                <span className="font-medium">✓ Ingår</span>
              </div>
              <div className="flex justify-between">
                <span>Besök & screeners</span>
                <span className="font-medium">✓ Ingår</span>
              </div>
              <div className="flex justify-between">
                <span>Prioriterad förtur</span>
                <span className="font-medium">
                  {currentPlan === 'free' ? '✗' : '✓ Kommer snart'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Alla användare har tillgång till krisstöd, säkerhetsplan och grundläggande funktioner.
              Inga abonnemang blockerar kritiska säkerhetsfunktioner.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SubscriptionSettingsPage