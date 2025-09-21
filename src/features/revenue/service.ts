import { supabase } from '@/integrations/supabase/client';

export type SubRow = { 
  subscribed: boolean | null; 
  subscription_tier: 'free' | 'plus' | 'pro' | string | null; 
  created_at?: string | null; 
  updated_at?: string | null 
};

export type DayRow = { 
  date: string; 
  total_revenue_cents: number | null; 
  subscription_revenue_cents: number | null; 
  new_subscribers: number | null; 
  churned_subscribers: number | null 
};

export async function fetchSubs(): Promise<SubRow[]> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('subscribed, subscription_tier, created_at, updated_at');
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchDaily(): Promise<DayRow[]> {
  try {
    const { data, error } = await supabase
      .from('payment_analytics')
      .select('date, total_revenue_cents, subscription_revenue_cents, new_subscribers, churned_subscribers')
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export function computeKPIs(subs: SubRow[], days: DayRow[]) {
  const plus = subs.filter(s => s.subscribed && s.subscription_tier === 'plus').length;
  const pro = subs.filter(s => s.subscribed && s.subscription_tier === 'pro').length;
  const free = subs.length - plus - pro;
  
  const pricePlus = Number(import.meta.env.VITE_PRICE_PLUS_CENTS || 0);
  const pricePro = Number(import.meta.env.VITE_PRICE_PRO_CENTS || 0);
  const mrrCents = plus * pricePlus + pro * pricePro;
  const arrCents = mrrCents * 12;

  const windowDays = (n: number) => {
    const since = new Date(Date.now() - n * 86400000);
    const newN = days.filter(d => new Date(d.date) >= since).reduce((a, d) => a + (d.new_subscribers || 0), 0);
    const churnN = days.filter(d => new Date(d.date) >= since).reduce((a, d) => a + (d.churned_subscribers || 0), 0);
    const activeStart = subs.length - newN + churnN; // naive approx
    const churnRate = activeStart > 0 ? churnN / activeStart : 0;
    return { newN, churnN, churnRate };
  };

  return {
    counts: { plus, pro, free, total: subs.length },
    money: { mrrCents, arrCents, currency: (import.meta.env.VITE_CURRENCY || 'SEK') },
    win7: windowDays(7), 
    win28: windowDays(28), 
    win90: windowDays(90)
  };
}

export function fmtMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}