-- Create subscribers table if not exists
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  subscribed boolean DEFAULT false,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_analytics table if not exists  
CREATE TABLE IF NOT EXISTS public.payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_revenue_cents integer DEFAULT 0,
  subscription_revenue_cents integer DEFAULT 0,
  pay_per_play_revenue_cents integer DEFAULT 0,
  active_subscribers integer DEFAULT 0,
  new_subscribers integer DEFAULT 0,
  churned_subscribers integer DEFAULT 0,
  stripe_transactions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscribers (users can only see their own)
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscribers  
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for payment_analytics (admin only for now - we'll make it more restrictive)
CREATE POLICY "Authenticated users can view analytics" ON public.payment_analytics
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger for subscribers
CREATE OR REPLACE FUNCTION public.update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscribers_updated_at();

-- Add updated_at trigger for payment_analytics  
CREATE OR REPLACE FUNCTION public.update_payment_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_analytics_updated_at
  BEFORE UPDATE ON public.payment_analytics
  FOR EACH ROW  
  EXECUTE FUNCTION public.update_payment_analytics_updated_at();