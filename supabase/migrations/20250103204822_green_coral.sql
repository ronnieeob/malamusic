/*
  # Premium Features and Payment Integration

  1. New Tables
    - `subscription_plans`
      - Premium plan configurations
      - Pricing and features
    - `user_subscriptions`
      - User subscription status and history
    - `payment_transactions`
      - Payment records and history
    
  2. Features
    - Multiple subscription tiers
    - Payment processing
    - Transaction history
    
  3. Security
    - RLS policies for subscriptions
    - Payment data protection
*/

-- Subscription Plans
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('artist', 'user')),
  price decimal(10,2) NOT NULL,
  interval text NOT NULL CHECK (interval IN ('monthly', 'yearly')),
  features jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Transactions
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  subscription_id uuid REFERENCES user_subscriptions ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_method text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id text,
  error_message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscription Plans
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- User Subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Payment Transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, type, price, interval, features) VALUES
  ('Artist Pro', 'artist', 9.99, 'monthly', '{
    "unlimited_uploads": true,
    "analytics": true,
    "custom_profile": true,
    "priority_support": true,
    "ad_free": true,
    "merch_store": true
  }'),
  ('Artist Pro Yearly', 'artist', 99.99, 'yearly', '{
    "unlimited_uploads": true,
    "analytics": true,
    "custom_profile": true,
    "priority_support": true,
    "ad_free": true,
    "merch_store": true,
    "yearly_discount": true
  }'),
  ('Premium User', 'user', 4.99, 'monthly', '{
    "ad_free": true,
    "offline_mode": true,
    "high_quality_audio": true,
    "exclusive_content": true
  }'),
  ('Premium User Yearly', 'user', 49.99, 'yearly', '{
    "ad_free": true,
    "offline_mode": true,
    "high_quality_audio": true,
    "exclusive_content": true,
    "yearly_discount": true
  }');

-- Functions for subscription management
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS trigger AS $$
BEGIN
  -- Update subscription status based on period end
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE current_period_end < now()
  AND status = 'active';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check subscription status
CREATE TRIGGER check_subscription_status_trigger
  AFTER INSERT OR UPDATE ON user_subscriptions
  EXECUTE FUNCTION check_subscription_status();

-- Function to process payment
CREATE OR REPLACE FUNCTION process_payment(
  p_user_id uuid,
  p_amount decimal,
  p_currency text,
  p_payment_method text,
  p_subscription_id uuid
) RETURNS uuid AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  INSERT INTO payment_transactions (
    user_id,
    subscription_id,
    amount,
    currency,
    payment_method,
    status
  ) VALUES (
    p_user_id,
    p_subscription_id,
    p_amount,
    p_currency,
    p_payment_method,
    'completed'
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;