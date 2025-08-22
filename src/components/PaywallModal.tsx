import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  CreditCard, 
  Lock, 
  Star, 
  Check, 
  Zap,
  Music,
  Video,
  Heart
} from 'lucide-react';

type ContentType = 'music' | 'video' | 'therapy_session';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  contentDescription?: string;
  price?: number; // in cents
  onPaymentComplete: () => void;
}

const PaywallModal = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle,
  contentDescription,
  price,
  onPaymentComplete
}: PaywallModalProps) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const { createPayPerPlaySession, createCheckoutSession } = useSubscription();
  const { t } = useGlobalLanguage();
  const navigate = useNavigate();

  const contentIcons = {
    music: Music,
    video: Video,
    therapy_session: Heart,
  };

  const defaultPrices = {
    music: 99, // $0.99
    video: 299, // $2.99
    therapy_session: 499, // $4.99
  };

  const finalPrice = price || defaultPrices[contentType];
  const ContentIcon = contentIcons[contentType];

  const handlePayPerPlay = async () => {
    try {
      setProcessingPayment(true);
      
      const result = await createPayPerPlaySession({
        contentType,
        contentId,
        amount: finalPrice,
      });

      if (result && result.requiresPayment) {
        // Handle Stripe payment with PaymentIntent
        // This would integrate with Stripe Elements in a real app
        console.log('Payment required:', result.clientSecret);
        
        // For demo purposes, simulate successful payment
        setTimeout(() => {
          onPaymentComplete();
          onClose();
          setProcessingPayment(false);
        }, 2000);
      } else {
        // Content already unlocked
        onPaymentComplete();
        onClose();
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setProcessingPayment(false);
    }
  };

  const handleUpgradeToPremium = () => {
    createCheckoutSession({
      planType: 'premium_monthly',
      paymentMethods: ['card', 'paypal'],
      countryCode: 'US'
    });
  };

  const handleViewAllPlans = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">Premium Content</DialogTitle>
          <DialogDescription>
            Choose how you'd like to access this content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Info */}
          <Card className="bg-muted/50">
            <CardContent className="flex items-center space-x-3 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ContentIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{contentTitle}</h3>
                {contentDescription && (
                  <p className="text-sm text-muted-foreground">{contentDescription}</p>
                )}
                <p className="text-sm font-medium text-primary capitalize">
                  {contentType.replace('_', ' ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* Pay Per Play Option */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={handlePayPerPlay}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Pay Once</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    ${(finalPrice / 100).toFixed(2)}
                  </Badge>
                </div>
                <CardDescription>
                  Unlock this {contentType.replace('_', ' ')} content permanently
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  onClick={handlePayPerPlay}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ${(finalPrice / 100).toFixed(2)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Subscription Option */}
            <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800 dark:text-amber-200">Premium Access</CardTitle>
                  </div>
                  <Badge className="bg-amber-600 text-white">
                    Best Value
                  </Badge>
                </div>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Unlock ALL content + unlimited AI coaching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  {['All music & video content', 'Unlimited AI coaching', 'Advanced mood tracking', 'Priority support'].map((benefit, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-600" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleUpgradeToPremium}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium - $19.99/month
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-2 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" onClick={handleViewAllPlans} className="flex-1">
              View All Plans
            </Button>
          </div>

          {/* Security Notice */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Secure payment processed by Stripe. Your payment information is encrypted and safe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;