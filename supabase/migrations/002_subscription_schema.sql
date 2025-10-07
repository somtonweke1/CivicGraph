-- Add subscription columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_tier, subscription_status);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, resource, month)
);

-- Enable RLS on usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update usage"
  ON usage_tracking FOR UPDATE
  USING (true);

-- Function to track usage
CREATE OR REPLACE FUNCTION track_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource TEXT
)
RETURNS void AS $$
DECLARE
  current_month DATE := DATE_TRUNC('month', NOW());
BEGIN
  INSERT INTO usage_tracking (user_id, action_type, resource, month, count)
  VALUES (p_user_id, p_action_type, p_resource, current_month, 1)
  ON CONFLICT (user_id, action_type, resource, month)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has exceeded limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_month DATE := DATE_TRUNC('month', NOW());
  user_tier TEXT;
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM user_profiles
  WHERE id = p_user_id;

  -- Free tier has 10 actions/month limit
  IF user_tier = 'Free' THEN
    usage_limit := 10;
  ELSE
    -- Paid tiers have unlimited
    RETURN TRUE;
  END IF;

  -- Get current usage
  SELECT COALESCE(count, 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND resource = p_resource
    AND month = current_month;

  -- Check if under limit
  RETURN current_usage < usage_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track civic action creation
CREATE OR REPLACE FUNCTION track_civic_action_usage()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM track_usage(NEW.user_id, 'civic_action', 'create');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_civic_action_trigger ON civic_actions;
CREATE TRIGGER track_civic_action_trigger
  AFTER INSERT ON civic_actions
  FOR EACH ROW
  EXECUTE FUNCTION track_civic_action_usage();

-- Create Stripe price IDs table (for managing pricing)
CREATE TABLE IF NOT EXISTS stripe_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name TEXT NOT NULL UNIQUE,
  price_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT DEFAULT 'month',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO stripe_prices (plan_name, price_id, amount, interval)
VALUES
  ('Pro', 'price_pro_monthly', 2900, 'month'),
  ('Team', 'price_team_monthly', 9900, 'month'),
  ('Nonprofit', 'price_nonprofit_monthly', 29900, 'month'),
  ('Enterprise', 'price_enterprise_monthly', 99900, 'month'),
  ('Government', 'price_government_monthly', 249900, 'month')
ON CONFLICT (plan_name) DO NOTHING;

COMMENT ON TABLE usage_tracking IS 'Tracks user resource usage for metering and billing';
COMMENT ON TABLE stripe_prices IS 'Stripe price IDs for subscription plans';
