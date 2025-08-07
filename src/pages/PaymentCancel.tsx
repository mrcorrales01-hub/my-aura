import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center bg-card/90 backdrop-blur-sm">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-foreground/70 mb-6">
          Your payment was cancelled. No charges were made to your account. You can try again anytime.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/pricing')} 
            className="w-full"
            variant="wellness"
          >
            View Plans Again
          </Button>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentCancel;