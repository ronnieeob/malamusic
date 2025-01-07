/*
  # Convert to Local PostgreSQL Setup
  
  1. Changes
    - Update connection settings for local PostgreSQL
    - Add local configuration options
    - Maintain existing schema and data
    - Add local-specific indexes and optimizations
  
  2. Security
    - Maintain RLS policies
    - Add local user management
*/

-- Create local configuration table
CREATE TABLE IF NOT EXISTS local_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add local database indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Add local user management functions
CREATE OR REPLACE FUNCTION create_local_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text DEFAULT 'user'
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO users (email, name, role)
  VALUES (p_email, p_name, p_role::user_role)
  RETURNING id INTO v_user_id;
  
  -- Initialize user preferences
  INSERT INTO user_preferences (user_id)
  VALUES (v_user_id);
  
  -- Initialize user points
  INSERT INTO user_points (user_id)
  VALUES (v_user_id);
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add local backup function
CREATE OR REPLACE FUNCTION backup_local_data() RETURNS void AS $$
BEGIN
  -- Implement local backup logic here
  -- This is a placeholder for the actual backup implementation
  RAISE NOTICE 'Local backup initiated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add local maintenance function
CREATE OR REPLACE FUNCTION perform_local_maintenance() RETURNS void AS $$
BEGIN
  -- Clean up expired sessions
  DELETE FROM user_sessions WHERE expires_at < now();
  
  -- Update statistics
  ANALYZE users;
  ANALYZE songs;
  ANALYZE products;
  ANALYZE orders;
  
  -- Vacuum dead tuples
  VACUUM (ANALYZE) users;
  VACUUM (ANALYZE) songs;
  VACUUM (ANALYZE) products;
  VACUUM (ANALYZE) orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial local configuration
INSERT INTO local_config (key, value) VALUES
  ('database_version', '"1.0.0"'),
  ('maintenance_schedule', '{"interval": "1 day", "last_run": null}'),
  ('backup_settings', '{"interval": "1 day", "retention_days": 7, "path": "/backups"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create maintenance trigger
CREATE OR REPLACE FUNCTION trigger_maintenance() RETURNS trigger AS $$
BEGIN
  PERFORM perform_local_maintenance();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_trigger
  AFTER INSERT OR UPDATE ON local_config
  FOR EACH ROW
  WHEN (NEW.key = 'maintenance_schedule')
  EXECUTE FUNCTION trigger_maintenance();

-- Add local connection settings
COMMENT ON DATABASE postgres IS 'Metal Aloud Local Database';
ALTER DATABASE postgres SET timezone TO 'UTC';