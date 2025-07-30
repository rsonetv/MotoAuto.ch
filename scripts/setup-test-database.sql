-- Test Database Setup Script
-- This script creates a separate test schema and sets up test data

-- Create test schema if not exists
CREATE SCHEMA IF NOT EXISTS test;

-- Set search path to use test schema first
SET search_path TO test, public;

-- Drop existing test tables (cleanup)
DROP TABLE IF EXISTS test.contact_messages CASCADE;
DROP TABLE IF EXISTS test.payments CASCADE;
DROP TABLE IF EXISTS test.bids CASCADE;
DROP TABLE IF EXISTS test.auctions CASCADE;
DROP TABLE IF EXISTS test.listings CASCADE;
DROP TABLE IF EXISTS test.packages CASCADE;
DROP TABLE IF EXISTS test.categories CASCADE;
DROP TABLE IF EXISTS test.profiles CASCADE;

-- Create test tables (copy structure from main schema)
CREATE TABLE test.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  dealer_name TEXT,
  is_dealer BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  canton TEXT,
  postal_code TEXT,
  bio TEXT,
  website TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  listings_count INTEGER DEFAULT 0,
  successful_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_it TEXT,
  description TEXT,
  parent_id UUID REFERENCES test.categories(id),
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_it TEXT,
  description TEXT,
  price_chf DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  max_listings INTEGER,
  max_images INTEGER DEFAULT 10,
  featured_placement BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  analytics_access BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES test.profiles(id),
  category_id UUID REFERENCES test.categories(id),
  package_id UUID REFERENCES test.packages(id),
  title TEXT NOT NULL,
  description TEXT,
  price_chf DECIMAL(10,2),
  currency TEXT DEFAULT 'CHF',
  condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
  year INTEGER,
  mileage INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  location TEXT,
  canton TEXT,
  postal_code TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  images JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'expired', 'draft')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES test.listings(id),
  starting_price_chf DECIMAL(10,2) NOT NULL,
  reserve_price_chf DECIMAL(10,2),
  current_price_chf DECIMAL(10,2),
  bid_increment_chf DECIMAL(10,2) DEFAULT 10.00,
  total_bids INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  extended_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
  winner_id UUID REFERENCES test.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES test.auctions(id),
  user_id UUID NOT NULL REFERENCES test.profiles(id),
  amount_chf DECIMAL(10,2) NOT NULL,
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_bid_chf DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES test.profiles(id),
  auction_id UUID REFERENCES test.auctions(id),
  package_id UUID REFERENCES test.packages(id),
  stripe_payment_intent_id TEXT,
  amount_chf DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CHF',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES test.profiles(id),
  listing_id UUID REFERENCES test.listings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  language TEXT DEFAULT 'de',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO test.profiles (id, email, full_name, is_dealer) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'test1@example.com', 'Test User 1', false),
  ('550e8400-e29b-41d4-a716-446655440002', 'test2@example.com', 'Test User 2', false),
  ('550e8400-e29b-41d4-a716-446655440003', 'dealer@example.com', 'Test Dealer', true);

INSERT INTO test.categories (id, name, description) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'Cars', 'Passenger cars'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Motorcycles', 'Motorcycles and scooters');

INSERT INTO test.packages (id, name, price_chf, duration_days, max_listings) VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Basic', 29.90, 30, 5),
  ('770e8400-e29b-41d4-a716-446655440002', 'Premium', 59.90, 30, 15);

-- Create indexes for performance
CREATE INDEX idx_test_listings_user_id ON test.listings(user_id);
CREATE INDEX idx_test_listings_category_id ON test.listings(category_id);
CREATE INDEX idx_test_auctions_listing_id ON test.auctions(listing_id);
CREATE INDEX idx_test_bids_auction_id ON test.bids(auction_id);
CREATE INDEX idx_test_bids_user_id ON test.bids(user_id);

-- Grant permissions (if needed for test user)
-- GRANT ALL PRIVILEGES ON SCHEMA test TO test_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA test TO test_user;
