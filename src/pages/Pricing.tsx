import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Sparkles, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { createCheckoutSession, subscribed, subscription_tier, openCustomerPortal } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$7.99',
      description: 'Essential wellness tools for getting started',
      icon: Star,
      color: 'text-wellness-secondary',
      features: [
        'Daily mood tracking',
        'Basic AI coach conversations',
        'Emergency resources',
        'Progress tracking',
        'Community access'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      id: 'plus',
      name: 'Plus',
      price: '$12.99',
      description: 'Enhanced features for deeper wellness work',
      icon: Sparkles,
      color: 'text-wellness-primary',
      features: [
        'Everything in Basic',
        'Advanced AI coaching',
        'Personalized Auri companion',
        'Relationship roleplay scenarios',
        'Weekly wellness reports',
        'Priority support'
      ],
      buttonText: 'Upgrade to Plus',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      description: 'Complete wellness ecosystem for transformation',
      icon: Crown,
      color: 'text-coral',
      features: [
        'Everything in Plus',
        'Unlimited AI conversations',
        'Custom wellness plans',
        '1-on-1 coaching sessions',
        'Advanced analytics',
        'Early access to new features',
        'Expert consultations'
      ],
      buttonText: 'Go Pro',
      popular: false
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (planId === 'basic' || (subscribed && subscription_tier === planId)) {
      return;
    }

    createCheckoutSession();
  };

  const getCurrentPlanId = () => {
    if (!subscribed) return 'basic';
    if (subscription_tier === 'Premium') return 'plus';
    if (subscription_tier === 'Enterprise') return 'pro';
    return 'basic';
  };

  const currentPlan = getCurrentPlanId();

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-wellness-primary mb-4">
            Choose Your Wellness Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of your emotional and relationship health with Aura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const isUpgrade = (currentPlan === 'basic' && plan.id !== 'basic') || 
                             (currentPlan === 'plus' && plan.id === 'pro');

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-wellness ${
                  plan.popular ? 'ring-2 ring-wellness-primary scale-105' : ''
                } ${isCurrentPlan ? 'bg-gradient-wellness border-wellness-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-wellness-primary">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className={`h-12 w-12 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-wellness-primary">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-wellness-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'wellness' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan && subscribed}
                  >
                    {isCurrentPlan && subscribed
                      ? 'Current Plan'
                      : isUpgrade
                      ? plan.buttonText
                      : plan.buttonText
                    }
                  </Button>

                  {isCurrentPlan && subscribed && (
                    <p className="text-center text-sm text-muted-foreground">
                      You're on the {plan.name} plan
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
          {user && subscribed && (
            <Button
              variant="link"
              onClick={openCustomerPortal}
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;