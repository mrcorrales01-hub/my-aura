import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Sparkles, ArrowRight } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  requiredTier?: 'premium' | 'pro';
  showPreview?: boolean;
}

export const PremiumGate = ({ 
  children, 
  feature, 
  description,
  requiredTier = 'premium',
  showPreview = false 
}: PremiumGateProps) => {
  const { subscribed, subscription_tier } = useSubscription();
  const navigate = useNavigate();

  // Check if user has required access
  const hasAccess = subscribed && (
    subscription_tier === 'premium' || subscription_tier === 'pro' || 
    (requiredTier === 'premium' && subscription_tier === 'pro')
  );

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierInfo = {
    premium: {
      icon: Crown,
      name: 'Premium',
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      benefits: ['Unlimited AI conversations', 'Advanced mood tracking', 'Personalized insights']
    },
    pro: {
      icon: Sparkles,
      name: 'Pro',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      benefits: ['Everything in Premium', 'Priority support', 'Early access to features']
    }
  };

  const currentTier = tierInfo[requiredTier];
  const TierIcon = currentTier.icon;

  return (
    <div className="relative">
      {/* Preview of content (blurred) */}
      {showPreview && (
        <div className="pointer-events-none">
          <div className="filter blur-sm opacity-50">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      )}

      {/* Premium upgrade prompt */}
      <Card className="relative border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full ${currentTier.color} flex items-center justify-center mb-4`}>
            <TierIcon className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1">
              <Star className="w-3 h-3" />
              {currentTier.name} Feature
            </Badge>
          </div>
          
          <CardTitle className="text-xl">
            Unlock {feature}
          </CardTitle>
          
          <CardDescription className="text-base">
            {description || `This feature requires ${currentTier.name} access to help you get the most out of your wellness journey.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits list */}
          <div className="space-y-2">
            <p className="font-medium text-sm text-center text-muted-foreground">
              What you'll get with {currentTier.name}:
            </p>
            <ul className="space-y-1">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/pricing')}
              className={`w-full ${currentTier.color} text-white hover:opacity-90 transition-all`}
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to {currentTier.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/pricing')}
              className="text-sm"
            >
              View all plans and pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Convenience wrapper for inline premium features
export const PremiumFeature = ({ 
  children, 
  feature, 
  description,
  requiredTier = 'premium' 
}: Omit<PremiumGateProps, 'showPreview'>) => (
  <PremiumGate
    feature={feature}
    description={description}
    requiredTier={requiredTier}
    showPreview={false}
  >
    {children}
  </PremiumGate>
);

// Wrapper that shows blurred preview
export const PremiumPreview = ({ 
  children, 
  feature, 
  description,
  requiredTier = 'premium' 
}: Omit<PremiumGateProps, 'showPreview'>) => (
  <PremiumGate
    feature={feature}
    description={description}
    requiredTier={requiredTier}
    showPreview={true}
  >
    {children}
  </PremiumGate>
);