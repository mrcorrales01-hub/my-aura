import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Heart, Zap, Shield, Users } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getSubscription } from '@/lib/subscription';
import { useState, useEffect } from 'react';

const Pricing = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      const sub = await getSubscription();
      setSubscription(sub);
    };
    loadSubscription();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started with mental wellness',
      features: [
        '50 AI coaching messages per week',
        'Basic mood tracking',
        '1 roleplay scenario',
        '2 wellness goals',
        'Community access (read-only)'
      ],
      icon: Heart,
      current: subscription?.tier === 'free'
    },
    {
      id: 'premium',
      name: 'Plus',
      price: '$9.99',
      period: '/month',
      description: 'Everything you need for comprehensive mental health support',
      features: [
        '500 AI coaching messages per week',
        'Advanced mood analytics & insights',
        'All 3 roleplay scenarios',
        'Unlimited wellness goals',
        'Weekly progress reports',
        'Full community participation'
      ],
      icon: Crown,
      popular: true,
      current: subscription?.tier === 'plus'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: '/month',
      description: 'Advanced features for power users',
      features: [
        'Unlimited AI coaching (fair use)',
        'Advanced roleplay scoring',
        'Data export capabilities',
        'Priority support',
        'Custom AI coaching personas',
        'Advanced reporting & insights'
      ],
      icon: Shield,
      current: subscription?.tier === 'pro'
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (planId === 'free') {
      return; // Already on free plan
    }

    // Mock checkout - simulate subscription activation
    setLoading(true)
    try {
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          subscribed: true,
          subscription_tier: planId === 'premium' ? 'plus' : 'pro',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      // Simulate delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      navigate('/')
      window.location.reload() // Refresh to update subscription state
    } catch (error) {
      console.error('Mock checkout error:', error)
    } finally {
      setLoading(false)
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-aura-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Wellness Journey
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Select the perfect plan to support your mental health and unlock your full potential.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-aura-primary scale-105' : 'border-aura-primary/20'
              } ${plan.current ? 'ring-2 ring-aura-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-aura-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="border-aura-primary text-aura-primary bg-background">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  plan.popular ? 'bg-aura-gradient' : 'bg-aura-primary/10'
                }`}>
                  <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-aura-primary'}`} />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-aura-primary">
                  {plan.price}
                  <span className="text-base font-normal text-foreground/60">{plan.period}</span>
                </div>
                <CardDescription className="text-center">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-aura-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-aura-primary hover:bg-aura-primary/90 text-white' 
                      : 'bg-aura-primary/10 hover:bg-aura-primary/20 text-aura-primary'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading || plan.current}
                >
                  {plan.current ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Manage Subscription */}
        {user && subscription?.active && (
          <div className="text-center">
            <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-aura-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Mock Subscription Active
                </h3>
                <p className="text-foreground/70 mb-4">
                  Your {subscription.tier} plan is active. In production, this would link to Stripe customer portal.
                </p>
                <Button 
                  variant="outline" 
                  disabled
                  className="border-aura-primary text-aura-primary hover:bg-aura-primary/10"
                >
                  Manage Subscription (Demo)
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Absolutely. We use end-to-end encryption and comply with HIPAA and GDPR standards 
                  to ensure your mental health data is completely secure and private.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Yes, you can cancel your subscription at any time through your account settings. 
                  You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  We accept all major credit cards, PayPal, Apple Pay, and Google Pay for your convenience.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Yes! Start with our free plan and upgrade when you're ready. 
                  No credit card required to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;