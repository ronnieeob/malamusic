/*
  # Initial schema for Metal Aloud

  1. New Tables
    - users (extends Supabase auth.users)
      - id (uuid, references auth.users)
      - username (text)
      - avatar_url (text)
      - created_at (timestamp)
    
    - genres
      - id (uuid)
      - name (text)
      - description (text)
      - image_url (text)
      - created_at (timestamp)
    
    - bands
      - id (uuid)
      - name (text)
      - formed_in (text)
      - image_url (text)
      - created_at (timestamp)
    
    - band_genres
      - band_id (uuid, references bands)
      - genre_id (uuid, references genres)
      - created_at (timestamp)
    
    - songs
      - id (uuid)
      - title (text)
      - artist (text)
      - album (text)
      - cover_url (text)
      - audio_url (text)
      - duration (integer)
      - band_id (uuid, references bands)
      - created_at (timestamp)
    
    - playlists
      - id (uuid)
      - name (text)
      - cover_url (text)
      - user_id (uuid, references users)
      - created_at (timestamp)
    
    - playlist_songs
      - playlist_id (uuid, references playlists)
      - song_id (uuid, references songs)
      - position (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  formed_in text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE band_genres (
  band_id uuid REFERENCES bands ON DELETE CASCADE,
  genre_id uuid REFERENCES genres ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (band_id, genre_id)
);

CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  cover_url text,
  audio_url text NOT NULL,
  duration integer NOT NULL,
  band_id uuid REFERENCES bands ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cover_url text,
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE playlist_songs (
  playlist_id uuid REFERENCES playlists ON DELETE CASCADE,
  song_id uuid REFERENCES songs ON DELETE CASCADE,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Everyone can read genres
CREATE POLICY "Anyone can read genres"
  ON genres
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read bands
CREATE POLICY "Anyone can read bands"
  ON bands
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read band_genres
CREATE POLICY "Anyone can read band_genres"
  ON band_genres
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read songs
CREATE POLICY "Anyone can read songs"
  ON songs
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can read all playlists
CREATE POLICY "Users can read all playlists"
  ON playlists
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own playlists
CREATE POLICY "Users can create own playlists"
  ON playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own playlists
CREATE POLICY "Users can update own playlists"
  ON playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete own playlists"
  ON playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read all playlist songs
CREATE POLICY "Users can read all playlist songs"
  ON playlist_songs
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage songs in their own playlists
CREATE POLICY "Users can manage own playlist songs"
  ON playlist_songs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );