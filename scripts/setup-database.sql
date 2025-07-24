-- setup-db-fixed.sql
-- Basic database schema with corrections for listings color column, images column, and idempotent policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 1. PROFILES TABLE
-- =========================
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    full_name text,
    avatar_url text,
    phone text,
    email_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- =========================
-- 2. LISTINGS TABLE
-- =========================
DROP TABLE IF EXISTS listings CASCADE;
CREATE TABLE listings (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    category text NOT NULL,
    brand text,
    model text,
    year integer,
    mileage integer,
    fuel_type text,
    transmission text,
    color text,                  -- NEW COLUMN so seed files work
    location text NOT NULL,
    images text[] DEFAULT '{}',  -- Ensure correct column name without trailing space
    is_auction boolean DEFAULT false,
    auction_end_time timestamptz,
    current_bid numeric(10,2),
    min_increment numeric(8,2) DEFAULT 1.00,
    buy_now_price numeric(10,2),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','expired')),
    views integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- =========================
-- 3. BIDS TABLE
-- =========================
DROP TABLE IF EXISTS bids CASCADE;
CREATE TABLE bids (
    id serial PRIMARY KEY,
    listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    placed_at timestamptz DEFAULT now()
);

-- =========================
-- 4. INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_listings_status_end ON listings(status, auction_end_time);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);

-- =========================
-- 5. ROW LEVEL SECURITY WITH IDEMPOTENT POLICIES
-- =========================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles select" ON profiles;
CREATE POLICY "Profiles select" ON profiles FOR SELECT USING (true);

-- Listings policies
DROP POLICY IF EXISTS "Users can view active listings" ON listings;
CREATE POLICY "Users can view active listings" ON listings FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert listings" ON listings;
CREATE POLICY "Users can insert listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify own listings" ON listings;
CREATE POLICY "Users can modify own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

-- Bids policies
DROP POLICY IF EXISTS "Users can view bids on own or active auctions" ON bids;
CREATE POLICY "Users can view bids on own or active auctions" ON bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND (auth.uid() = user_id OR status = 'active'))
);

DROP POLICY IF EXISTS "Users can place bid if auction active and not own listing" ON bids;
CREATE POLICY "Users can place bid if auction active and not own listing" ON bids FOR INSERT WITH CHECK (
    auth.uid() != (SELECT user_id FROM listings WHERE id = listing_id) AND
    EXISTS (
        SELECT 1 FROM listings
        WHERE id = listing_id
          AND is_auction
          AND status = 'active'
          AND auction_end_time > now()
    )
);
