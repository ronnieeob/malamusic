/*
  # Add Viral Features and Rewards System

  1. New Tables
    - `referrals` - Track user referrals
    - `user_points` - Track reward points
    - `rewards` - Available rewards
    - `user_rewards` - Redeemed rewards

  2. Changes
    - Add referral tracking
    - Add points system
    - Add rewards program

  3. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create referrals table
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users ON DELETE SET NULL,
  referred_id uuid REFERENCES users ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user points table
CREATE TABLE user_points (
  user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL,
  reward_type text NOT NULL,
  metadata jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user rewards table
CREATE TABLE user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  reward_id uuid REFERENCES rewards ON DELETE SET NULL,
  points_spent integer NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active rewards"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Users can view their redeemed rewards"
  ON user_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_points integer,
  p_reason text
) RETURNS void AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, lifetime_points)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_points,
    lifetime_points = user_points.lifetime_points + p_points,
    last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial rewards
INSERT INTO rewards (name, description, points_required, reward_type, metadata) VALUES
  ('Premium Song Download', 'Download any song for free', 500, 'download', '{"limit": 1}'),
  ('Exclusive Artist Interview', 'Access to exclusive artist interviews', 1000, 'content', '{"duration": "30min"}'),
  ('Merch Discount 25%', '25% off any merchandise purchase', 2000, 'discount', '{"percentage": 25}'),
  ('Virtual Backstage Pass', 'Join virtual meet & greets', 5000, 'event', '{"duration": "1hour"}');