-- 1. Profiles (rozszerzona tabela użytkowników)

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Listings (ogłoszenia i aukcje)

CREATE TABLE IF NOT EXISTS listings (
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
  location text NOT NULL,
  images text[] DEFAULT '{}',
  is_auction boolean DEFAULT false,
  auction_end_time timestamp with time zone,
  current_bid numeric(10,2),
  min_increment numeric(8,2) DEFAULT 1.00,
  buy_now_price numeric(10,2),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','expired')),
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Bids (oferty na aukcjach)

CREATE TABLE IF NOT EXISTS bids (
  id serial PRIMARY KEY,
  listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  placed_at timestamp with time zone DEFAULT now()
);

-- 4. Indeksy wydajnościowe

CREATE INDEX IF NOT EXISTS idx_listings_status_end ON listings(status, auction_end_time);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);

-- 5. Row Level Security

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profile policies

CREATE POLICY "Profiles select" ON profiles
  FOR SELECT USING (true);

-- Listings policies

CREATE POLICY "Users can view active listings" ON listings
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Bids policies

CREATE POLICY "Users can view bids on own or active auctions" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id
        AND (auth.uid() = user_id OR status = 'active')
    )
  );

CREATE POLICY "Users can place bid if auction active and not own listing" ON bids
  FOR INSERT WITH CHECK (
    auth.uid() != (
      SELECT user_id FROM listings WHERE id = listing_id
    )
    AND EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_id
        AND is_auction
        AND status = 'active'
        AND auction_end_time > now()
    )
  );
