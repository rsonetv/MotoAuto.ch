-- Complete database setup for MotoAuto.ch with Supabase
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- Create listings table
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  current_bid DECIMAL(10,2) CHECK (current_bid >= 0),
  category TEXT NOT NULL CHECK (category IN ('auto', 'moto')),
  
  -- Vehicle details
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  mileage INTEGER CHECK (mileage >= 0),
  engine_capacity INTEGER CHECK (engine_capacity > 0), -- in cc
  power INTEGER CHECK (power > 0), -- in HP
  fuel_type TEXT,
  transmission TEXT,
  drive_type TEXT, -- FWD, RWD, AWD
  body_type TEXT,
  doors INTEGER CHECK (doors > 0 AND doors <= 10),
  seats INTEGER CHECK (seats > 0 AND seats <= 20),
  color TEXT,
  vin TEXT,
  
  -- Condition and history
  condition TEXT,
  accident_free BOOLEAN DEFAULT TRUE,
  owners_count INTEGER DEFAULT 1 CHECK (owners_count > 0),
  has_service_book BOOLEAN DEFAULT FALSE,
  last_service_date DATE,
  next_service_due INTEGER CHECK (next_service_due >= 0), -- km
  
  -- Location
  location TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8) CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(11, 8) CHECK (longitude >= -180 AND longitude <= 180),
  
  -- Media
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Auction settings
  is_auction BOOLEAN DEFAULT FALSE,
  auction_start_time TIMESTAMP WITH TIME ZONE,
  auction_end_time TIMESTAMP WITH TIME ZONE,
  reserve_price DECIMAL(10,2) CHECK (reserve_price >= 0),
  buy_now_price DECIMAL(10,2) CHECK (buy_now_price >= 0),
  min_bid_increment DECIMAL(10,2) DEFAULT 100 CHECK (min_bid_increment > 0),
  auto_extend BOOLEAN DEFAULT TRUE,
  
  -- Additional options
  warranty_months INTEGER CHECK (warranty_months >= 0),
  financing_available BOOLEAN DEFAULT FALSE,
  trade_in_accepted BOOLEAN DEFAULT FALSE,
  delivery_available BOOLEAN DEFAULT FALSE,
  
  -- Status and metrics
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'draft')),
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  favorites_count INTEGER DEFAULT 0 CHECK (favorites_count >= 0),
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_auction_times CHECK (
    NOT is_auction OR (auction_start_time IS NOT NULL AND auction_end_time IS NOT NULL AND auction_end_time > auction_start_time)
  ),
  CONSTRAINT valid_featured_until CHECK (
    NOT featured OR featured_until IS NULL OR featured_until > NOW()
  )
);

-- Create bids table
CREATE TABLE bids (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_bid DECIMAL(10,2) CHECK (max_auto_bid >= amount),
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(listing_id, user_id, amount)
);

-- Create favorites table
CREATE TABLE favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, listing_id)
);

-- Create messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_message CHECK (sender_id != recipient_id)
);

-- Create saved searches table
CREATE TABLE saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  search_params JSONB NOT NULL,
  email_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_model ON listings(model);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_year ON listings(year);
CREATE INDEX idx_listings_mileage ON listings(mileage);
CREATE INDEX idx_listings_location ON listings USING gin(location gin_trgm_ops);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_is_auction ON listings(is_auction);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_featured ON listings(featured, featured_until);
CREATE INDEX idx_listings_user_id ON listings(user_id);

CREATE INDEX idx_bids_listing_id ON bids(listing_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_placed_at ON bids(placed_at DESC);
CREATE INDEX idx_bids_amount ON bids(amount DESC);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Full text search index
CREATE INDEX idx_listings_search ON listings USING gin(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(brand, '') || ' ' || 
    COALESCE(model, '')
  )
);

-- Create functions
CREATE OR REPLACE FUNCTION increment_views(listing_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE listings 
  SET views = views + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at 
  BEFORE UPDATE ON listings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for listings
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (
  status = 'active' OR auth.uid() = user_id
);
CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bids
CREATE POLICY "Users can view bids for listings they own or bid on" ON bids FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM listings WHERE id = listing_id)
);
CREATE POLICY "Users can create bids" ON bids FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND is_auction = true AND status = 'active')
);

-- RLS Policies for favorites
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for saved searches
CREATE POLICY "Users can manage own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
