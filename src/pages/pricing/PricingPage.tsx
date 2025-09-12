import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Gift } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanDb } from '@/features/subscription/db'
import { startCheckout } from '@/features/subscription/checkout'
import { PlanId } from '@/features/subscription/plan'

const PricingPage = () => {
  const { t } = useTranslation('pricing')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free')
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState<PlanId | null>(null)

  const hasStripe = !!(import.meta.env.VITE_STRIPE_PK && import.meta.env.VITE_STRIPE_PRICE_PLUS)

  useEffect(() => {
    getPlanDb().then(({plan}) => setCurrentPlan(plan))
  }, [])

  const handleSelectPlan = async (plan: PlanId) => {
    if (!user) {
      navigate('/auth')
      return
    }

    if (plan === 'free') {
      // Handle downgrade
      setLoading(true)
      try {
        const { setPlanDb } = await import('@/features/subscription/db')
        await setPlanDb('free')
        setCurrentPlan('free')
      } catch (error) {
        console.error('Downgrade failed:', error)
      } finally {
        setLoading(false)
      }
      return
    }

    if (plan === currentPlan) return

    setUpgrading(plan)
    try {
      const result = await startCheckout(plan)
      if (result?.simulated) {
        setCurrentPlan(plan)
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setUpgrading(null)
    }
  }

  const plans = [
    {
      id: 'free' as PlanId,
      name: t('free'),
      price: '0',
      icon: Gift,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      features: [
        `${t('auriDaily')}: 20`,
        t('roleplay'),
        t('coach'),
        t('pdf'),
        t('visit'),
        t('timeline')
      ]
    },
    {
      id: 'plus' as PlanId,
      name: t('plus'),
      price: '99',
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      popular: true,
      features: [
        `${t('auriDaily')}: 200`,
        t('roleplay'),
        t('coach'),
        t('pdf'),
        t('visit'),
        t('timeline'),
        t('priority')
      ]
    },
    {
      id: 'pro' as PlanId,
      name: t('pro'),
      price: '199',
      icon: Crown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      features: [
        `${t('auriDaily')}: Obegränsat`,
        t('roleplay'),
        t('coach'),
        t('pdf'),
        t('visit'),
        t('timeline'),
        t('priority')
      ]
    }
  ]

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('signedOut')}</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Logga in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
        {!hasStripe && (
          <Badge variant="outline" className="mt-2 text-amber-600 border-amber-600">
            {t('devNote')}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-300 hover:shadow-lg ${
              plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
            } ${currentPlan === plan.id ? 'ring-2 ring-green-500/20 border-green-500' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Populär
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 ${plan.color}`} />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}kr
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.price !== '0' && t('perMonth')}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('features')}
                </h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || upgrading === plan.id}
                className={`w-full ${
                  currentPlan === plan.id
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : ''
                }`}
                variant={currentPlan === plan.id ? 'default' : plan.popular ? 'default' : 'outline'}
              >
                {upgrading === plan.id ? (
                  'Uppgraderar...'
                ) : currentPlan === plan.id ? (
                  t('current')
                ) : plan.id === 'free' ? (
                  t('downgrade')
                ) : (
                  t('cta')
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Alla planer inkluderar krisstöd, besök och grundläggande funktioner.</p>
        {currentPlan !== 'free' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/subscription')}
            className="mt-4"
          >
            {t('manage')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default PricingPage