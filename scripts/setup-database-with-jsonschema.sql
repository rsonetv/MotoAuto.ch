-- scripts/setup-database-with-jsonschema.sql
-- MotoAuto.ch – Complete, Fixed Schema with JSON Schema Validation

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Drop existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trg_listings_updated_at ON listings;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS validate_profile_data(JSONB) CASCADE;
DROP FUNCTION IF EXISTS validate_listing_data(JSONB) CASCADE;
DROP FUNCTION IF EXISTS validate_bid_data(JSONB) CASCADE;
DROP FUNCTION IF EXISTS get_profile_schema() CASCADE;
DROP FUNCTION IF EXISTS get_listing_schema() CASCADE;
DROP FUNCTION IF EXISTS get_bid_schema() CASCADE;

-- 3. Drop all tables for a clean slate
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. users table
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. profiles table (with phone_verified and is_dealer)
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  phone               TEXT,
  email_verified      BOOLEAN     DEFAULT FALSE,
  phone_verified      BOOLEAN     DEFAULT FALSE,
  is_dealer           BOOLEAN     DEFAULT FALSE,
  dealer_name         TEXT,
  dealer_license      TEXT,
  location            TEXT,
  postal_code         TEXT,
  bio                 TEXT,
  website             TEXT,
  social_links        JSONB       DEFAULT '{}'::jsonb,
  preferences         JSONB       DEFAULT '{}'::jsonb,
  verification_status TEXT        DEFAULT 'pending'
                                 CHECK (verification_status IN ('pending','verified','rejected')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. listings table (complete vehicle data)
CREATE TABLE listings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT,
  category          TEXT        NOT NULL CHECK (category IN ('auto','moto','commercial')),
  brand             TEXT        NOT NULL,
  model             TEXT        NOT NULL,
  year              INTEGER,
  mileage           INTEGER,
  engine_capacity   NUMERIC(4,2),
  power             INTEGER,
  fuel_type         TEXT        CHECK (fuel_type IS NULL OR fuel_type IN ('petrol','diesel','electric','hybrid','gas','other')),
  transmission      TEXT        CHECK (transmission IS NULL OR transmission IN ('manual','automatic','semi-automatic')),
  color             TEXT,
  vin               TEXT        CHECK (vin IS NULL OR vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  condition         TEXT        DEFAULT 'used' CHECK (condition IN ('new','used','damaged')),
  accident_free     BOOLEAN     DEFAULT TRUE,
  owners_count      INTEGER     DEFAULT 1,
  has_service_book  BOOLEAN     DEFAULT FALSE,
  price             NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency          TEXT        DEFAULT 'CHF' CHECK (currency IN ('CHF','EUR','USD')),
  location          TEXT        NOT NULL,
  postal_code       TEXT,
  images            TEXT[]      DEFAULT '{}',
  features          JSONB       DEFAULT '{}'::jsonb,
  is_auction        BOOLEAN     DEFAULT FALSE,
  auction_end_time  TIMESTAMPTZ,
  min_bid_increment NUMERIC(10,2),
  reserve_price     NUMERIC(12,2),
  current_bid       NUMERIC(12,2),
  bid_count         INTEGER     DEFAULT 0,
  status            TEXT        DEFAULT 'active' CHECK (status IN ('active','sold','expired','draft')),
  views             INTEGER     DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 7. bids table
CREATE TABLE bids (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  is_auto_bid  BOOLEAN     DEFAULT FALSE,
  max_auto_bid NUMERIC(12,2),
  status       TEXT        DEFAULT 'active' CHECK (status IN ('active','outbid','winning','won','lost')),
  placed_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 8. favorites table
CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email           ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_dealer       ON profiles(is_dealer);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified  ON profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code     ON profiles(postal_code);
CREATE INDEX IF NOT EXISTS idx_listings_user_id         ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category        ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_brand           ON listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_status          ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_is_auction      ON listings(is_auction);
CREATE INDEX IF NOT EXISTS idx_listings_location        ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_postal_code     ON listings(postal_code);
CREATE INDEX IF NOT EXISTS idx_listings_created_at      ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_listing_id          ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id             ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_placed_at           ON bids(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id        ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id     ON favorites(listing_id);

-- 10. Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. JSON Schema functions
CREATE OR REPLACE FUNCTION get_profile_schema() RETURNS JSONB AS $$
BEGIN
  RETURN $json$
  {
    "type":"object",
    "properties":{
      "id":{"type":"string","format":"uuid"},
      "email":{"type":"string","format":"email","maxLength":255},
      "full_name":{"type":["string","null"],"maxLength":100},
      "avatar_url":{"type":["string","null"],"format":"uri","maxLength":500},
      "phone":{"type":["string","null"],"pattern":"^[+]?[0-9\\s\\-()]{7,20}$"},
      "email_verified":{"type":"boolean"},
      "phone_verified":{"type":"boolean"},
      "is_dealer":{"type":"boolean"},
      "dealer_name":{"type":["string","null"],"maxLength":100},
      "dealer_license":{"type":["string","null"],"maxLength":50},
      "location":{"type":["string","null"],"maxLength":100},
      "postal_code":{"type":["string","null"],"maxLength":10},
      "bio":{"type":["string","null"],"maxLength":500},
      "website":{"type":["string","null"],"format":"uri","maxLength":255},
      "social_links":{"type":"object","additionalProperties":{"type":"string","format":"uri"}},
      "preferences":{"type":"object","additionalProperties":true},
      "verification_status":{"type":"string","enum":["pending","verified","rejected"]},
      "created_at":{"type":"string","format":"date-time"},
      "updated_at":{"type":"string","format":"date-time"}
    },
    "required":["id","email","email_verified","phone_verified","is_dealer","created_at","updated_at"],
    "additionalProperties":false
  }
  $json$::jsonb;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_listing_schema() RETURNS JSONB AS $$
BEGIN
  RETURN $json$
  {
    "type":"object",
    "properties":{
      "id":{"type":"string","format":"uuid"},
      "user_id":{"type":"string","format":"uuid"},
      "title":{"type":"string","minLength":10,"maxLength":200},
      "description":{"type":["string","null"],"maxLength":5000},
      "category":{"type":"string","enum":["auto","moto","commercial"]},
      "brand":{"type":"string","minLength":1,"maxLength":50},
      "model":{"type":"string","minLength":1,"maxLength":100},
      "year":{"type":["integer","null"],"minimum":1900,"maximum":2030},
      "mileage":{"type":["integer","null"],"minimum":0,"maximum":9999999},
      "engine_capacity":{"type":["number","null"],"minimum":0.1,"maximum":15.0},
      "power":{"type":["integer","null"],"minimum":1,"maximum":2000},
      "fuel_type":{"type":["string","null"],"enum":["petrol","diesel","electric","hybrid","gas","other"]},
      "transmission":{"type":["string","null"],"enum":["manual","automatic","semi-automatic"]},
      "color":{"type":["string","null"],"maxLength":50},
      "vin":{"type":["string","null"],"pattern":"^[A-HJ-NPR-Z0-9]{17}$"},
      "condition":{"type":"string","enum":["new","used","damaged"]},
      "accident_free":{"type":"boolean"},
      "owners_count":{"type":["integer","null"],"minimum":1,"maximum":10},
      "has_service_book":{"type":"boolean"},
      "price":{"type":"number","minimum":0,"maximum":99999999.99},
      "currency":{"type":"string","enum":["CHF","EUR","USD"]},
      "location":{"type":"string","minLength":2,"maxLength":100},
      "postal_code":{"type":["string","null"],"maxLength":10},
      "images":{"type":"array","items":{"type":"string","format":"uri"},"maxItems":20},
      "features":{"type":"object","additionalProperties":true},
      "is_auction":{"type":"boolean"},
      "auction_end_time":{"type":["string","null"],"format":"date-time"},
      "min_bid_increment":{"type":["number","null"],"minimum":0.01},
      "reserve_price":{"type":["number","null"],"minimum":0},
      "current_bid":{"type":["number","null"],"minimum":0},
      "bid_count":{"type":"integer","minimum":0},
      "status":{"type":"string","enum":["active","sold","expired","draft"]},
      "views":{"type":"integer","minimum":0},
      "created_at":{"type":"string","format":"date-time"},
      "updated_at":{"type":"string","format":"date-time"}
    },
    "required":["user_id","title","category","brand","model","price","location"],
    "additionalProperties":false
  }
  $json$::jsonb;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_bid_schema() RETURNS JSONB AS $$
BEGIN
  RETURN $json$
  {
    "type":"object",
    "properties":{
      "id":{"type":"string","format":"uuid"},
      "listing_id":{"type":"string","format":"uuid"},
      "user_id":{"type":"string","format":"uuid"},
      "amount":{"type":"number","minimum":0.01,"maximum":99999999.99},
      "is_auto_bid":{"type":"boolean"},
      "max_auto_bid":{"type":["number","null"],"minimum":0.01},
      "status":{"type":"string","enum":["active","outbid","winning","won","lost"]},
      "placed_at":{"type":"string","format":"date-time"},
      "created_at":{"type":"string","format":"date-time"}
    },
    "required":["listing_id","user_id","amount"],
    "additionalProperties":false
  }
  $json$::jsonb;
END;
$$ LANGUAGE plpgsql;

-- 12. Enable RLS and create idempotent policies
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids      ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='select_profiles') THEN
    CREATE POLICY select_profiles ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='update_own_profile') THEN
    CREATE POLICY update_own_profile ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Listings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND policyname='select_listings') THEN
    CREATE POLICY select_listings ON listings FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='listings' AND policyname='manage_own_listings') THEN
    CREATE POLICY manage_own_listings ON listings FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Bids policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bids' AND policyname='select_bids') THEN
    CREATE POLICY select_bids ON bids FOR SELECT USING (
      bids.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bids' AND policyname='insert_bids') THEN
    CREATE POLICY insert_bids ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Favorites policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorites' AND policyname='manage_favorites') THEN
    CREATE POLICY manage_favorites ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;
END;
$$;

COMMIT;
