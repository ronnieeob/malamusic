/*
  # Integrate Additional Features

  1. New Tables
    - `user_settings` - Store user preferences and settings
    - `user_stats` - Track user activity and statistics
    - `user_rewards` - Store user rewards and points
    - `user_notifications` - Store user notifications
    - `user_messages` - Store user messages
    - `user_follows` - Track user follows/followers
    - `user_friend_requests` - Track friend requests

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access
    - Add functions for social interactions

  3. Changes
    - Add social features to existing tables
    - Add notification system
    - Add messaging system
*/

-- User Settings
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  language text DEFAULT 'en',
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Stats
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  songs_played integer DEFAULT 0,
  playlists_created integer DEFAULT 0,
  total_listening_time integer DEFAULT 0,
  favorite_genre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Rewards
CREATE TABLE user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  points integer DEFAULT 0,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Notifications
CREATE TABLE user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- User Messages
CREATE TABLE user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users ON DELETE SET NULL,
  receiver_id uuid REFERENCES auth.users ON DELETE SET NULL,
  content text NOT NULL,
  type text DEFAULT 'text',
  metadata jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User Follows
CREATE TABLE user_follows (
  follower_id uuid REFERENCES auth.users ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- User Friend Requests
CREATE TABLE user_friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies

-- User Settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Rewards
CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Notifications
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Messages
CREATE POLICY "Users can view their messages"
  ON user_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON user_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- User Follows
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage follows"
  ON user_follows FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id);

-- User Friend Requests
CREATE POLICY "Users can view their requests"
  ON user_friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send requests"
  ON user_friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create functions for social interactions
CREATE OR REPLACE FUNCTION follow_user(follower_id uuid, following_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_follows (follower_id, following_id)
  VALUES (follower_id, following_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unfollow_user(follower_id uuid, following_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM user_follows
  WHERE follower_id = $1 AND following_id = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION send_friend_request(sender_id uuid, receiver_id uuid)
RETURNS uuid AS $$
DECLARE
  request_id uuid;
BEGIN
  INSERT INTO user_friend_requests (sender_id, receiver_id)
  VALUES (sender_id, receiver_id)
  RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_friend_request(request_id uuid, status text)
RETURNS void AS $$
BEGIN
  UPDATE user_friend_requests
  SET status = $2, updated_at = now()
  WHERE id = $1;
  
  -- If accepted, create mutual follows
  IF status = 'accepted' THEN
    INSERT INTO user_follows (follower_id, following_id)
    SELECT sender_id, receiver_id FROM user_friend_requests WHERE id = $1
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_follows (follower_id, following_id)
    SELECT receiver_id, sender_id FROM user_friend_requests WHERE id = $1
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;