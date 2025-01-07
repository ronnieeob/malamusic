/*
  # Add Profile and Preferences Tables

  1. New Tables
    - `user_preferences`
      - User-specific preferences for playback, notifications, and privacy
    - `user_stats`
      - Tracking user listening history and achievements
    - `achievements`
      - Available achievements that users can unlock
    - `user_achievements`
      - Junction table for tracking unlocked achievements

  2. Changes
    - Add listening stats columns to users table
    - Add preferences relationship

  3. Security
    - Enable RLS on all new tables
    - Add policies for user access
*/

-- Create achievements table
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user achievements junction table
CREATE TABLE user_achievements (
  user_id uuid REFERENCES users ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Create user preferences table
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  volume integer NOT NULL DEFAULT 80,
  notifications jsonb NOT NULL DEFAULT '{"newReleases": true, "artistUpdates": true, "recommendations": false}'::jsonb,
  privacy jsonb NOT NULL DEFAULT '{"showListeningActivity": true, "showPlaylists": true, "showPurchases": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user stats table
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  total_listening_time integer DEFAULT 0,
  favorite_genre text,
  top_artist text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Achievements are readable by all authenticated users
CREATE POLICY "Achievements are readable by all"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can read their own achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read and update their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read their own stats
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id uuid,
  p_listening_time integer,
  p_genre text DEFAULT NULL,
  p_artist text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_listening_time, favorite_genre, top_artist)
  VALUES (p_user_id, p_listening_time, p_genre, p_artist)
  ON CONFLICT (user_id) DO UPDATE SET
    total_listening_time = user_stats.total_listening_time + p_listening_time,
    favorite_genre = COALESCE(p_genre, user_stats.favorite_genre),
    top_artist = COALESCE(p_artist, user_stats.top_artist),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;