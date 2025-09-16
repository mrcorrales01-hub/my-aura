import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

type PlanType = 'free' | 'premium_monthly' | 'premium_yearly' | 'enterprise';
type ContentType = 'music' | 'video' | 'therapy_session';

interface SubscriptionState {
  subscribed: boolean;
  tier: PlanType;
  endDate: string | null;
  loading: boolean;
  payPerPlayHistory: any[];
}

interface PayPerPlayOptions {
  contentType: ContentType;
  contentId: string;
  amount?: number;
}

interface CheckoutOptions {
  planType: PlanType;
  paymentMethods?: string[];
  countryCode?: string;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (options: CheckoutOptions) => Promise<void>;
  createPayPerPlaySession: (options: PayPerPlayOptions) => Promise<any>;
  openCustomerPortal: () => Promise<void>;
  hasAccessToContent: (contentId: string, contentType: ContentType) => Promise<boolean>;
  getUserReceipts: () => Promise<any[]>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<PlanType>('free');
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [payPerPlayHistory, setPayPerPlayHistory] = useState<any[]>([]);
  
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    // In development, bypass subscription checks if VITE_SUBS_REQUIRED is not true
    if (import.meta.env.VITE_SUBS_REQUIRED !== 'true') {
      setSubscribed(false);
      setTier('free');
      setEndDate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.warn('Subscription check failed, silently defaulting to free tier:', error);
        setSubscribed(false);
        setTier('free');
        setEndDate(null);
        return;
      }

      setSubscribed(data.subscribed || false);
      setTier(data.subscription_tier || 'free');
      setEndDate(data.subscription_end || null);
    } catch (error) {
      console.warn('Subscription check error, silently defaulting to free tier:', error);
      setSubscribed(false);
      setTier('free');
      setEndDate(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (options: CheckoutOptions) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('enhanced-create-checkout', {
        body: options,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPayPerPlaySession = async (options: PayPerPlayOptions) => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access premium content",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('pay-per-play', {
        body: options,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating pay-per-play session:', error);
        toast({
          title: "Error",
          description: "Failed to process payment",
          variant: "destructive",
        });
        return null;
      }

      if (!data.requiresPayment) {
        toast({
          title: "Content Unlocked",
          description: data.message,
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating pay-per-play session:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const hasAccessToContent = async (contentId: string, contentType: ContentType): Promise<boolean> => {
    if (!user) return false;
    
    // Premium users have access to all content
    if (subscribed && ['premium_monthly', 'premium_yearly', 'enterprise'].includes(tier)) {
      return true;
    }

    // Check if user paid for this specific content
    try {
      const { data, error } = await supabase
        .from('pay_per_play_transactions')
        .select('payment_status')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('payment_status', 'completed')
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  };

  const getUserReceipts = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching receipts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: "Error",
          description: "Failed to open customer portal",
          variant: "destructive",
        });
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      checkSubscription();
    }
  }, [user, session]);

  return (
    <SubscriptionContext.Provider value={{
      subscribed,
      tier,
      endDate,
      loading,
      payPerPlayHistory,
      checkSubscription,
      createCheckoutSession,
      createPayPerPlaySession,
      openCustomerPortal,
      hasAccessToContent,
      getUserReceipts,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};