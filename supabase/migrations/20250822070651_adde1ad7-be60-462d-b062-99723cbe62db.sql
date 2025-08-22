-- Fix security warnings by setting proper search paths for functions

-- Update generate_receipt_number function with secure search path
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update set_receipt_number function with secure search path
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Update update_payment_analytics function with secure search path
CREATE OR REPLACE FUNCTION update_payment_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;