-- Rozszerzenie UUID (jeśli nie masz jeszcze stworzonego)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profile użytkowników
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_dealer BOOLEAN DEFAULT FALSE,
  dealer_name TEXT,
  dealer_license TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Lista ogłoszeń (auta/motocykle)
DROP TABLE IF EXISTS listings CASCADE;
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  current_bid DECIMAL(10,2),
  category TEXT NOT NULL CHECK (category IN ('auto', 'moto')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  mileage INTEGER,
  engine_capacity INTEGER,
  power INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  drive_type TEXT,
  body_type TEXT,
  doors INTEGER,
  seats INTEGER,
  color TEXT,
  vin TEXT,
  condition TEXT,
  accident_free BOOLEAN DEFAULT TRUE,
  owners_count INTEGER DEFAULT 1,
  has_service_book BOOLEAN DEFAULT FALSE,
  last_service_date DATE,
  next_service_due INTEGER,
  location TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  video_url TEXT,
  is_auction BOOLEAN DEFAULT FALSE,
  auction_start_time TIMESTAMP WITH TIME ZONE,
  auction_end_time TIMESTAMP WITH TIME ZONE,
  reserve_price DECIMAL(10,2),
  buy_now_price DECIMAL(10,2),
  min_bid_increment DECIMAL(10,2) DEFAULT 100,
  auto_extend BOOLEAN DEFAULT TRUE,
  warranty_months INTEGER,
  financing_available BOOLEAN DEFAULT FALSE,
  trade_in_accepted BOOLEAN DEFAULT FALSE,
  delivery_available BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'draft')),
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE
);

-- 3. Oferty w licytacji
DROP TABLE IF EXISTS bids CASCADE;
CREATE TABLE bids (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_bid DECIMAL(10,2),
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id, amount)
);

-- 4. Ulubione
DROP TABLE IF EXISTS favorites CASCADE;
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 5. Wiadomości (komunikacja kupujący-sprzedający)
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Zapisane wyszukiwania
DROP TABLE IF EXISTS saved_searches CASCADE;
CREATE TABLE saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_params JSONB NOT NULL,
  email_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_mileage ON listings(mileage);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_is_auction ON listings(is_auction);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_placed_at ON bids(placed_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || description || ' ' || brand || ' ' || model));

-- 8. (opcjonalnie – RLS i polityki, jeśli tego wymaga projekt – zostaw puste, jeśli RLS nie jest teraz potrzebne)
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY ...;

-- --- KONIEC ---

-- NIE MA ŻADNYCH INSERT -- SKRYPT NIE TWORZY DANYCH PRZYKŁADOWYCH!
