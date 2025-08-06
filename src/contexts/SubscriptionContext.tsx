import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckoutSession: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true
  });

  const checkSubscription = async () => {
    if (!session) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setState({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckoutSession = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const openCustomerPortal = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setState({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        loading: false
      });
    }
  }, [user, session]);

  return (
    <SubscriptionContext.Provider value={{
      ...state,
      checkSubscription,
      createCheckoutSession,
      openCustomerPortal
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