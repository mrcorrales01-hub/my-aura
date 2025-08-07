import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSubscription } from '@/contexts/SubscriptionContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { checkSubscription } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status after successful payment
    if (sessionId) {
      checkSubscription();
    }
  }, [sessionId, checkSubscription]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center bg-card/90 backdrop-blur-sm">
        <div className="w-16 h-16 bg-wellness-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-wellness-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-foreground/70 mb-6">
          Welcome to Premium! Your subscription is now active and you have access to all premium features.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            variant="wellness"
          >
            Go to Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate('/pricing')} 
            variant="outline"
            className="w-full"
          >
            View Subscription Details
          </Button>
        </div>
        
        {sessionId && (
          <p className="text-xs text-muted-foreground mt-4">
            Session ID: {sessionId}
          </p>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccess;