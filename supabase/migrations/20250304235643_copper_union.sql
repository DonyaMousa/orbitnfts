/*
  # Initial Schema Setup

  1. Tables
    - users
    - nfts
    - collections
    - transactions
    - likes
    - views

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE,
  email text UNIQUE,
  avatar_url text,
  bio text,
  is_verified boolean DEFAULT false,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  creator_id uuid REFERENCES users(id),
  banner_url text,
  image_url text,
  verified boolean DEFAULT false,
  floor_price numeric(78,0) DEFAULT 0,
  volume numeric(78,0) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NFTs table
CREATE TABLE IF NOT EXISTS nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  metadata_url text NOT NULL,
  creator_id uuid REFERENCES users(id),
  owner_id uuid REFERENCES users(id),
  collection_id uuid REFERENCES collections(id),
  price numeric(78,0),
  currency text DEFAULT 'ETH',
  is_listed boolean DEFAULT false,
  is_auction boolean DEFAULT false,
  auction_end timestamptz,
  highest_bid numeric(78,0),
  highest_bidder_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid REFERENCES nfts(id),
  seller_id uuid REFERENCES users(id),
  buyer_id uuid REFERENCES users(id),
  price numeric(78,0) NOT NULL,
  currency text DEFAULT 'ETH',
  transaction_hash text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  nft_id uuid REFERENCES nfts(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nft_id)
);

-- Views table
CREATE TABLE IF NOT EXISTS views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  nft_id uuid REFERENCES nfts(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users policies
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Collections policies
CREATE POLICY "Anyone can read collections"
  ON collections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

-- NFTs policies
CREATE POLICY "Anyone can read NFTs"
  ON nfts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can update their NFTs"
  ON nfts FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Likes policies
CREATE POLICY "Users can read all likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Views policies
CREATE POLICY "Users can read all views"
  ON views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create views"
  ON views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);