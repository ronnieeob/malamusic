/*
  # Add password reset functionality
  
  1. New Tables
    - password_reset_tokens
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - token (text, unique)
      - expires_at (timestamptz)
      - created_at (timestamptz)
      - used_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for token verification
*/

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  CONSTRAINT token_not_expired CHECK (expires_at > now())
);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can verify tokens"
  ON password_reset_tokens
  FOR SELECT
  USING (
    expires_at > now() 
    AND used_at IS NULL
  );

-- Create function to generate reset token
CREATE OR REPLACE FUNCTION generate_password_reset_token(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_token text;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;

  IF v_token IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Generate token
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Insert token
  INSERT INTO password_reset_tokens (user_id, token, expires_at)
  VALUES (
    v_user_id,
    v_token,
    now() + interval '1 hour'
  );

  RETURN v_token;
END;
$$;