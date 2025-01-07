/*
  # Add e-commerce and user roles

  1. New Tables
    - `user_roles` - Store user roles (admin, artist, user)
    - `products` - Store merchandise items
    - `orders` - Track purchases
    - `order_items` - Individual items in orders
    - `artist_profiles` - Additional artist information
    - `song_purchases` - Track song purchases

  2. Changes
    - Add role management
    - Add e-commerce functionality
    - Add artist features

  3. Security
    - Role-based access control
    - Purchase tracking
    - Artist management
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'artist', 'user');

-- Add role to users table
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create artist profiles
CREATE TABLE artist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  bio text,
  website text,
  social_links jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artist_profiles ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE,
  product_id uuid REFERENCES products ON DELETE SET NULL,
  quantity integer NOT NULL,
  price_at_time decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create song purchases table
CREATE TABLE song_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  song_id uuid REFERENCES songs ON DELETE SET NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add price to songs
ALTER TABLE songs ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 0.99;
ALTER TABLE songs ADD COLUMN artist_id uuid REFERENCES artist_profiles ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Artist Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON artist_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can update own profile"
  ON artist_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE id = products.artist_id
      AND user_id = auth.uid()
    )
  );

-- Orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order Items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND user_id = auth.uid()
    )
  );

-- Song Purchases
CREATE POLICY "Users can view own purchases"
  ON song_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON song_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin Functions
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;