import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Crown, 
  Heart, 
  Zap, 
  Shield, 
  Users, 
  Sparkles, 
  CreditCard,
  Apple,
  Smartphone,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useNavigate } from 'react-router-dom';

const EnhancedPricing = () => {
  const { user } = useAuth();
  const { subscribed, tier, createCheckoutSession, openCustomerPortal, loading } = useSubscription();
  const { t } = useGlobalLanguage();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'SE', name: 'Sweden', currency: 'SEK' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started with mental wellness',
      features: [
        '3 AI coaching sessions per month',
        'Basic mood tracking',
        'Daily wellness tips',
        'Community access (read-only)',
        'Email support',
        'Limited music & video content'
      ],
      icon: Heart,
      current: !subscribed || tier === 'free',
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-600',
      paymentMethods: []
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      description: 'Everything you need for comprehensive mental health support',
      features: [
        'Unlimited AI coaching sessions',
        'Advanced mood analytics & insights',
        'Personalized wellness plans',
        'Full community participation',
        'Priority chat support',
        'ALL meditation & breathing exercises',
        'ALL music & therapy videos',
        'Weekly progress reports',
        'Goal setting & tracking',
        'Pay-per-play not required'
      ],
      icon: Crown,
      popular: true,
      current: tier === 'premium_monthly' || tier === 'premium_yearly',
      color: 'from-blue-500 to-purple-600',
      textColor: 'text-blue-600',
      paymentMethods: ['card', 'paypal', 'apple_pay', 'google_pay']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      description: 'Advanced features for organizations and teams',
      features: [
        'Everything in Premium',
        'Team dashboard & analytics',
        'Custom AI coaching personas',
        'Advanced reporting & insights',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'HIPAA compliance tools',
        'White-label options',
        'Priority phone support'
      ],
      icon: Shield,
      current: tier === 'enterprise',
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      paymentMethods: ['card', 'paypal', 'wire_transfer']
    }
  ];

  const paymentMethodIcons = {
    card: CreditCard,
    paypal: Globe,
    apple_pay: Apple,
    google_pay: Smartphone,
    wire_transfer: CreditCard,
    klarna: CreditCard,
    swish: Smartphone
  };

  const getAvailablePaymentMethods = (planPaymentMethods: string[]) => {
    let methods = [...planPaymentMethods];
    
    // Add region-specific payment methods
    if (selectedCountry === 'SE') methods.push('swish');
    if (['US', 'GB', 'DE'].includes(selectedCountry)) methods.push('klarna');
    
    return methods;
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (planId === 'free') {
      return; // Already on free plan
    }

    const planType = isYearly && planId === 'premium_monthly' ? 'premium_yearly' : planId;
    const availablePaymentMethods = getAvailablePaymentMethods(
      plans.find(p => p.id === planId)?.paymentMethods || ['card']
    );

    await createCheckoutSession({
      planType: planType as any,
      paymentMethods: availablePaymentMethods,
      countryCode: selectedCountry
    });
  };

  const getCurrentPlanId = () => {
    if (!subscribed) return 'free';
    if (tier === 'premium_monthly' || tier === 'premium_yearly') return 'premium_monthly';
    if (tier === 'enterprise') return 'enterprise';
    return 'free';
  };

  const getDisplayPrice = (plan: any) => {
    if (plan.id === 'free') return 'Free';
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const period = isYearly ? '/year' : '/month';
    return `$${price}${period}`;
  };

  const getSavingsText = (plan: any) => {
    if (!isYearly || plan.id === 'free') return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return `Save ${percentage}% ($${savings})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-aura-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Wellness Journey
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
            Select the perfect plan to support your mental health and unlock your full potential.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className={`font-medium ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`font-medium ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save up to 17%
              </Badge>
            )}
          </div>

          {/* Country Selector */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1 bg-background border border-border rounded-md text-sm"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-aura-primary scale-105 ring-2 ring-aura-primary/20' : 'border-aura-primary/20'
              } ${plan.current ? 'ring-2 ring-aura-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-aura-primary text-white px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
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
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${plan.color}`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-aura-primary">
                  {getDisplayPrice(plan)}
                  {getSavingsText(plan) && (
                    <div className="text-sm font-normal text-green-600 mt-1">
                      {getSavingsText(plan)}
                    </div>
                  )}
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

                {/* Payment Methods */}
                {plan.id !== 'free' && (
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Available payment methods:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailablePaymentMethods(plan.paymentMethods).map(method => {
                        const IconComponent = paymentMethodIcons[method as keyof typeof paymentMethodIcons];
                        return (
                          <div key={method} className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs">
                            <IconComponent className="w-3 h-3" />
                            <span className="capitalize">{method.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile App Information */}
        <Card className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Apple className="w-8 h-8" />
              <Smartphone className="w-8 h-8" />
            </div>
            <CardTitle>Mobile App Available</CardTitle>
            <CardDescription>
              Download My Aura on iOS and Android for the full experience with in-app purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Mobile users can subscribe directly through the App Store or Google Play Store with their preferred payment method.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <Apple className="w-4 h-4" />
                <span>App Store</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>Google Play</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manage Subscription */}
        {user && subscribed && (
          <div className="text-center mb-16">
            <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-aura-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-aura-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Manage Your Subscription
                </h3>
                <p className="text-foreground/70 mb-4">
                  Update payment methods, change plans, or cancel anytime.
                </p>
                <Button 
                  variant="outline" 
                  onClick={openCustomerPortal}
                  disabled={loading}
                  className="border-aura-primary text-aura-primary hover:bg-aura-primary/10"
                >
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <Tabs defaultValue="general" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, you can cancel your subscription at any time through your account settings or the customer portal. You'll continue to have access until the end of your billing period."
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! Start with our free plan and upgrade when you're ready. No credit card required to get started with basic features."
                },
                {
                  q: "What's the difference between monthly and yearly plans?",
                  a: "Yearly plans offer significant savings (up to 17% off) compared to monthly billing. All features remain the same."
                },
                {
                  q: "Can I switch plans later?",
                  a: "Absolutely! You can upgrade, downgrade, or switch between monthly and yearly billing anytime through the customer portal."
                }
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and region-specific methods like Klarna (EU/US) and Swish (Sweden)."
                },
                {
                  q: "Is pay-per-play available?",
                  a: "Yes! Non-subscribers can purchase individual music tracks, videos, or therapy sessions. Premium subscribers get unlimited access to all content."
                },
                {
                  q: "Are there any hidden fees?",
                  a: "No hidden fees ever. The price you see is what you pay. Taxes may apply based on your location."
                },
                {
                  q: "Do you offer refunds?",
                  a: "We offer a 30-day money-back guarantee for new subscriptions. Contact support for refund requests."
                }
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">Security & Privacy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: "Is my payment information secure?",
                  a: "Yes! All payments are processed securely through Stripe with bank-level encryption. We never store your payment details on our servers."
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use end-to-end encryption and comply with HIPAA and GDPR standards to ensure your mental health data is completely secure and private."
                },
                {
                  q: "What about GDPR compliance?",
                  a: "We're fully GDPR compliant. You have full control over your data, including the right to export, modify, or delete it at any time."
                },
                {
                  q: "Do you share my data with third parties?",
                  a: "Never. Your personal and mental health data is private and confidential. We only share anonymized, aggregated data for research purposes with your explicit consent."
                }
              ].map((faq, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPricing;