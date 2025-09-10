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

export async function getSubscription(): Promise<SubscriptionStatus> {
  // Dev override
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

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        tier: 'free',
        active: false,
        limits: {
          ...TIER_LIMITS.free,
          auriUsed: 0,
        },
      };
    }

    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('subscribed, subscription_tier')
      .eq('email', session.user.email)
      .maybeSingle();

    const tier = (subscriber?.subscription_tier || 'free') as SubscriptionTier;
    const active = subscriber?.subscribed || false;

    // Get usage for current week (Auri messages)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count: auriUsed } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', weekStart.toISOString());

    return {
      tier,
      active: active && tier !== 'free',
      limits: {
        ...TIER_LIMITS[tier],
        auriUsed: auriUsed || 0,
      },
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      tier: 'free',
      active: false,
      limits: {
        ...TIER_LIMITS.free,
        auriUsed: 0,
      },
    };
  }
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  await supabase
    .from('subscribers')
    .upsert({
      email: session.user.email || '',
      subscribed: tier !== 'free',
      subscription_tier: tier,
    }, { onConflict: 'email' });
}