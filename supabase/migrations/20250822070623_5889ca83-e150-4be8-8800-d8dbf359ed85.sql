-- Create comprehensive payment and subscription system

-- Create subscribers table (enhanced version)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'premium_monthly', 'premium_yearly', 'enterprise')),
  subscription_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  payment_method TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pay-per-play transactions table
CREATE TABLE public.pay_per_play_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('music', 'video', 'therapy_session')),
  content_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create payment receipts table  
CREATE TABLE public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'pay_per_play')),
  transaction_id UUID,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  receipt_number TEXT UNIQUE NOT NULL,
  receipt_data JSONB NOT NULL DEFAULT '{}',
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin analytics table for financial tracking
CREATE TABLE public.payment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue_cents INTEGER NOT NULL DEFAULT 0,
  subscription_revenue_cents INTEGER NOT NULL DEFAULT 0,
  pay_per_play_revenue_cents INTEGER NOT NULL DEFAULT 0,
  active_subscribers INTEGER NOT NULL DEFAULT 0,
  new_subscribers INTEGER NOT NULL DEFAULT 0,
  churned_subscribers INTEGER NOT NULL DEFAULT 0,
  stripe_transactions INTEGER NOT NULL DEFAULT 0,
  apple_transactions INTEGER NOT NULL DEFAULT 0,
  google_transactions INTEGER NOT NULL DEFAULT 0,
  refund_amount_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create mobile app purchase table for Apple/Google billing
CREATE TABLE public.mobile_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  product_id TEXT NOT NULL,
  purchase_token TEXT NOT NULL,
  receipt_data JSONB NOT NULL DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_per_play_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscribers
CREATE POLICY "users_own_subscription" ON public.subscribers
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for pay-per-play transactions
CREATE POLICY "users_own_transactions" ON public.pay_per_play_transactions
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for payment receipts
CREATE POLICY "users_own_receipts" ON public.payment_receipts
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for mobile purchases
CREATE POLICY "users_own_purchases" ON public.mobile_purchases
  FOR ALL USING (user_id = auth.uid());

-- Admin-only access to analytics (no RLS policy means only admins with service role can access)
CREATE POLICY "admin_only_analytics" ON public.payment_analytics
  FOR ALL USING (false); -- Only service role can access

-- Create indexes for performance
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_stripe_customer ON public.subscribers(stripe_customer_id);
CREATE INDEX idx_pay_per_play_user_date ON public.pay_per_play_transactions(user_id, created_at);
CREATE INDEX idx_payment_receipts_user ON public.payment_receipts(user_id);
CREATE INDEX idx_payment_analytics_date ON public.payment_analytics(date);
CREATE INDEX idx_mobile_purchases_user ON public.mobile_purchases(user_id);

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := to_char(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(year_month) + 2) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM payment_receipts 
  WHERE receipt_number LIKE year_month || '-%';
  
  RETURN year_month || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number_trigger
  BEFORE INSERT ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION set_receipt_number();

-- Create function to update payment analytics
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER AS $$
DECLARE
  analytics_date DATE := CURRENT_DATE;
BEGIN
  -- Upsert daily analytics
  INSERT INTO payment_analytics (
    date,
    total_revenue_cents,
    subscription_revenue_cents,
    pay_per_play_revenue_cents,
    active_subscribers,
    new_subscribers,
    churned_subscribers,
    stripe_transactions
  )
  VALUES (
    analytics_date,
    0, 0, 0, 0, 0, 0, 0
  )
  ON CONFLICT (date) DO NOTHING;
  
  -- Update based on trigger type
  IF TG_TABLE_NAME = 'subscribers' THEN
    IF TG_OP = 'INSERT' AND NEW.subscribed = true THEN
      UPDATE payment_analytics SET new_subscribers = new_subscribers + 1 WHERE date = analytics_date;
    ELSIF TG_OP = 'UPDATE' AND OLD.subscribed = true AND NEW.subscribed = false THEN
      UPDATE payment_analytics SET churned_subscribers = churned_subscribers + 1 WHERE date = analytics_date;
    END IF;
  ELSIF TG_TABLE_NAME = 'pay_per_play_transactions' AND NEW.payment_status = 'completed' THEN
    UPDATE payment_analytics SET 
      pay_per_play_revenue_cents = pay_per_play_revenue_cents + NEW.amount_cents,
      total_revenue_cents = total_revenue_cents + NEW.amount_cents,
      stripe_transactions = stripe_transactions + 1
    WHERE date = analytics_date;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for analytics updates
CREATE TRIGGER update_analytics_subscribers
  AFTER INSERT OR UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_analytics();

CREATE TRIGGER update_analytics_pay_per_play
  AFTER INSERT OR UPDATE ON pay_per_play_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_analytics();