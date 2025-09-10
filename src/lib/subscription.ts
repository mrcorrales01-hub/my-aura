import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  active: boolean;
  limits: {
    auriMessages: number;
    auriUsed: number;
    roleplayScenarios: number;
    planGoals: number;
    hasWeeklyReview: boolean;
    hasAdvancedRoleplay: boolean;
    hasDataExport: boolean;
  };
}

const TIER_LIMITS = {
  free: {
    auriMessages: 50,
    roleplayScenarios: 1,
    planGoals: 2,
    hasWeeklyReview: false,
    hasAdvancedRoleplay: false,
    hasDataExport: false,
  },
  plus: {
    auriMessages: 500,
    roleplayScenarios: 3,
    planGoals: -1, // unlimited
    hasWeeklyReview: true,
    hasAdvancedRoleplay: false,
    hasDataExport: false,
  },
  pro: {
    auriMessages: -1, // unlimited (fair use)
    roleplayScenarios: 3,
    planGoals: -1, // unlimited
    hasWeeklyReview: true,
    hasAdvancedRoleplay: true,
    hasDataExport: true,
  },
};

// New mocked subscription system
export const getPlan = (): SubscriptionTier => {
  const plan = localStorage.getItem('aura.plan');
  return (plan === 'plus' || plan === 'pro') ? plan as SubscriptionTier : 'free';
};

export const hasVisitPack = (): boolean => {
  const plan = getPlan();
  return ['plus', 'pro'].includes(plan);
};

export const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true';

// Backward compatibility with existing subscription system
export async function getSubscription(): Promise<SubscriptionStatus> {
  // Mock version using localStorage
  if (import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'false') {
    return {
      tier: 'pro',
      active: true,
      limits: {
        ...TIER_LIMITS.pro,
        auriUsed: 0,
      },
    };
  }

  const tier = getPlan();
  const active = tier !== 'free';

  return {
    tier,
    active,
    limits: {
      ...TIER_LIMITS[tier],
      auriUsed: 0, // Mock usage
    },
  };
}

export function canUseFeature(
  subscription: SubscriptionStatus,
  feature: keyof SubscriptionStatus['limits'],
  requestedAmount: number = 1
): boolean {
  const limit = subscription.limits[feature];
  
  if (typeof limit === 'boolean') {
    return limit;
  }
  
  if (limit === -1) return true; // unlimited
  
  if (feature === 'auriMessages') {
    return subscription.limits.auriUsed + requestedAmount <= limit;
  }
  
  return requestedAmount <= limit;
}

export async function updateSubscription(tier: SubscriptionTier): Promise<void> {
  localStorage.setItem('aura.plan', tier);
}