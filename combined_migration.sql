-- Combined migration file from all scripts in supabase/migrations

-- Contents from supabase/migrations/001_auth_profiles.sql
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profile: select own"
  on public.profiles for select using (auth.uid() = id);

create policy "Profile: insert own"
  on public.profiles for insert with check (auth.uid() = id);

-- Contents from supabase/migrations/002_add_is_auction_to_listings.sql
ALTER TABLE public.listings
ADD COLUMN is_auction BOOLEAN DEFAULT FALSE;

-- Contents from supabase/migrations/20250729000001_create_initial_schema.sql
-- Create initial schema for MotoAuto.ch
-- Author: MotoAuto.ch Team
-- Date: 2025-07-29

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
  vat_number TEXT,
  dealer_license TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_sales INTEGER DEFAULT 0,
  free_listings_used INTEGER DEFAULT 0,
  current_package_id UUID,
  package_expires_at TIMESTAMPTZ,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  bid_notifications BOOLEAN DEFAULT TRUE,
  listing_updates BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_en TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'CHF',
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_images INTEGER DEFAULT 10,
  description TEXT,
  features JSONB DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  package_id UUID REFERENCES public.packages(id),
  
  -- Basic listing info
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CHF',
  
  -- Vehicle details
  mileage INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  condition TEXT,
  
  -- Location
  location TEXT,
  canton TEXT,
  postal_code TEXT,
  
  -- Media and status
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'suspended')),
  sale_type TEXT DEFAULT 'listing' CHECK (sale_type IN ('listing', 'auction')),
  
  -- Analytics
  views INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timing
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Auction specific fields
  starting_price DECIMAL(10,2),
  reserve_price DECIMAL(10,2),
  current_bid DECIMAL(10,2),
  auction_end_time TIMESTAMPTZ,
  bid_count INTEGER DEFAULT 0,
  is_reserve_met BOOLEAN DEFAULT FALSE
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  max_bid DECIMAL(10,2),
  is_auto_bid BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id),
  package_id UUID REFERENCES public.packages(id),
  type TEXT NOT NULL CHECK (type IN ('package_purchase', 'commission', 'refund', 'penalty')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CHF',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  payment_method TEXT,
  stripe_payment_id TEXT,
  invoice_url TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_dealer ON public.profiles(is_dealer);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_sale_type ON public.listings(sale_type);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER categories_updated_at 
  BEFORE UPDATE ON public.categories 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER packages_updated_at 
  BEFORE UPDATE ON public.packages 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER listings_updated_at 
  BEFORE UPDATE ON public.listings 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER bids_updated_at 
  BEFORE UPDATE ON public.bids 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

-- Packages policies (public read)
CREATE POLICY "Packages are publicly readable" ON public.packages
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

-- Listings policies
CREATE POLICY "Users can view own listings" ON public.listings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listings" ON public.listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active listings" ON public.listings
  FOR SELECT TO authenticated, anon
  USING (status = 'active');

-- Bids policies
CREATE POLICY "Users can view own bids" ON public.bids
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bids" ON public.bids
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Listing owners can view bids on their listings" ON public.bids
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can manage own watchlist" ON public.watchlist
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contents from supabase/migrations/20250729000002_create_functions.sql
-- Create database functions for MotoAuto.ch
-- Author: MotoAuto.ch Team
-- Date: 2025-07-29

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to execute SQL (replacement for missing public.exec)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment listing views
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE(
  active_listings BIGINT,
  total_views BIGINT,
  active_bids BIGINT,
  successful_sales BIGINT,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.listings WHERE user_id = user_uuid AND status = 'active')::BIGINT,
    (SELECT COALESCE(SUM(views), 0) FROM public.listings WHERE user_id = user_uuid)::BIGINT,
    (SELECT COUNT(*) FROM public.bids WHERE user_id = user_uuid AND status IN ('active', 'winning'))::BIGINT,
    (SELECT COUNT(*) FROM public.listings WHERE user_id = user_uuid AND status = 'sold')::BIGINT,
    (SELECT COALESCE(SUM(price), 0) FROM public.listings WHERE user_id = user_uuid AND status = 'sold')::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update listing bid information
CREATE OR REPLACE FUNCTION public.update_listing_bid(
  listing_uuid UUID,
  new_bid_amount DECIMAL,
  bidder_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_highest DECIMAL;
  reserve_price DECIMAL;
BEGIN
  -- Get current highest bid and reserve price
  SELECT current_bid, listings.reserve_price 
  INTO current_highest, reserve_price
  FROM public.listings 
  WHERE id = listing_uuid;
  
  -- Check if new bid is higher than current
  IF new_bid_amount > COALESCE(current_highest, 0) THEN
    -- Update listing with new highest bid
    UPDATE public.listings 
    SET 
      current_bid = new_bid_amount,
      bid_count = bid_count + 1,
      is_reserve_met = CASE 
        WHEN reserve_price IS NOT NULL AND new_bid_amount >= reserve_price THEN TRUE
        ELSE is_reserve_met
      END,
      updated_at = NOW()
    WHERE id = listing_uuid;
    
    -- Update previous winning bids to outbid
    UPDATE public.bids 
    SET status = 'outbid', updated_at = NOW()
    WHERE listing_id = listing_uuid AND status = 'winning' AND user_id != bidder_uuid;
    
    -- Update current bid to winning
    UPDATE public.bids 
    SET status = 'winning', updated_at = NOW()
    WHERE listing_id = listing_uuid AND user_id = bidder_uuid AND amount = new_bid_amount;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search listings with filters
CREATE OR REPLACE FUNCTION public.search_listings(
  search_query TEXT DEFAULT NULL,
  category_slug TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  brand_filter TEXT DEFAULT NULL,
  year_from INTEGER DEFAULT NULL,
  year_to INTEGER DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  price DECIMAL,
  currency TEXT,
  mileage INTEGER,
  location TEXT,
  images TEXT[],
  views INTEGER,
  created_at TIMESTAMPTZ,
  category_name TEXT,
  user_full_name TEXT,
  user_is_dealer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.brand,
    l.model,
    l.year,
    l.price,
    l.currency,
    l.mileage,
    l.location,
    l.images,
    l.views,
    l.created_at,
    c.name as category_name,
    p.full_name as user_full_name,
    p.is_dealer as user_is_dealer
  FROM public.listings l
  LEFT JOIN public.categories c ON l.category_id = c.id
  LEFT JOIN public.profiles p ON l.user_id = p.id
  WHERE 
    l.status = 'active'
    AND (search_query IS NULL OR (
      l.title ILIKE '%' || search_query || '%' 
      OR l.brand ILIKE '%' || search_query || '%'
      OR l.model ILIKE '%' || search_query || '%'
    ))
    AND (category_slug IS NULL OR c.slug = category_slug)
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (brand_filter IS NULL OR l.brand = brand_filter)
    AND (year_from IS NULL OR l.year >= year_from)
    AND (year_to IS NULL OR l.year <= year_to)
  ORDER BY l.created_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contents from supabase/migrations/20250730000001_contact_tables.sql
-- Create contact-related tables
-- Author: MotoAuto.ch Team
-- Date: 2025-07-30

-- Create contact_categories table
CREATE TABLE IF NOT EXISTS public.contact_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_en TEXT,
  name_pl TEXT,
  description TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_en TEXT,
  description_pl TEXT,
  icon TEXT,
  email_recipient TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general_inquiry',
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new',
  language TEXT NOT NULL DEFAULT 'de',
  ip_address TEXT,
  user_agent TEXT,
  recaptcha_score FLOAT,
  recaptcha_action TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON public.contact_messages (user_id);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS contact_messages_category_idx ON public.contact_messages (category);
CREATE INDEX IF NOT EXISTS contact_messages_listing_id_idx ON public.contact_messages (listing_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact categories policies (public read, admin write)
CREATE POLICY "Contact categories are viewable by everyone" 
  ON public.contact_categories FOR SELECT USING (true);

CREATE POLICY "Contact categories are insertable by admins only" 
  ON public.contact_categories FOR INSERT WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

CREATE POLICY "Contact categories are updatable by admins only" 
  ON public.contact_categories FOR UPDATE USING (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

CREATE POLICY "Contact categories are deletable by admins only" 
  ON public.contact_categories FOR DELETE USING (
    (auth.uid() IN (SELECT id FROM public.admin_users))
  );

-- Contact messages policies
CREATE POLICY "Contact messages are viewable by admins and the message sender" 
  ON public.contact_messages FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.admin_users) OR
    auth.uid() = user_id
  );

CREATE POLICY "Contact messages are insertable by everyone" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Contact messages are updatable by admins only" 
  ON public.contact_messages FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Contact messages are deletable by admins only" 
  ON public.contact_messages FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.admin_users)
  );

-- Create trigger for updated_at
CREATE TRIGGER set_contact_categories_updated_at
BEFORE UPDATE ON public.contact_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Contents from supabase/migrations/20250731135803_add_user_id_to_packages.sql
-- supabase/migrations/20250731135803_add_user_id_to_packages.sql

-- Step 1: Add the user_id column to the packages table
ALTER TABLE public.packages
ADD COLUMN user_id UUID;

-- Step 2: Add a foreign key constraint to link user_id to the auth.users table
ALTER TABLE public.packages
ADD CONSTRAINT packages_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE; -- Optional: Deletes packages if the user is deleted

-- Step 3: Add a policy to ensure users can only see their own packages
-- First, enable Row Level Security (RLS) on the table if it's not already enabled
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read packages" ON public.packages;
DROP POLICY IF EXISTS "Allow individual user access to their own packages" ON public.packages;

-- Create a new policy that allows users to perform all actions on their own packages
CREATE POLICY "Allow individual user access to their own packages"
ON public.packages
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Optional: If you want to allow read access for all authenticated users, you can add this policy instead or as well
-- CREATE POLICY "Allow authenticated read access"
-- ON public.packages
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- Contents from supabase/migrations/20250731180500_add_sort_order_to_packages.sql
-- Add sort_order column to packages table
ALTER TABLE public.packages
ADD COLUMN sort_order INTEGER;

-- Optional: Set a default sort order for existing packages
-- This will prevent null values and ensure a consistent order.
-- You might want to adjust the logic based on your needs.
UPDATE public.packages
SET sort_order = 
  CASE 
    WHEN id = 'private' THEN 1
    WHEN id = 'dealer-lite' THEN 2
    WHEN id = 'dealer-starter' THEN 3
    WHEN id = 'dealer-pro' THEN 4
    WHEN id = 'dealer-enterprise' THEN 5
    ELSE 99
  END
WHERE sort_order IS NULL;

-- Contents from supabase/migrations/20250731212900_add_geolocation_to_listings.sql
-- Włączenie rozszerzenia PostGIS, jeśli nie jest aktywne
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Dodanie kolumny 'location' do tabeli 'listings' do przechowywania współrzędnych
ALTER TABLE public.listings
ADD COLUMN location geography(Point, 4326);

-- Utworzenie indeksu przestrzennego GIST w celu optymalizacji zapytań
CREATE INDEX listings_location_idx ON public.listings USING GIST (location);

-- Stworzenie funkcji RPC do wyszukiwania ogłoszeń w zadanym promieniu
CREATE OR REPLACE FUNCTION search_listings_by_distance(
    lat float,
    long float,
    radius_km float
)
RETURNS SETOF listings AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.listings
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        radius_km * 1000 -- ST_DWithin dla typu geography oczekuje promienia w metrach
    );
END;
$$ LANGUAGE plpgsql;

-- Funkcja zwracająca tylko ID ogłoszeń w danym promieniu (wydajniejsza do filtrowania)
CREATE OR REPLACE FUNCTION get_listing_ids_in_radius(
    lat float,
    long float,
    radius_km float
)
RETURNS TABLE(id uuid) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id
    FROM public.listings AS l
    WHERE ST_DWithin(
        l.location,
        ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
        radius_km * 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Contents from supabase/migrations/20250801193038_add_listing_translations_workflow.sql
ALTER TABLE public.listings
ADD COLUMN title_translations JSONB DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.handle_listing_translation_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Sprawdź, czy polski tytuł się zmienił
  IF NEW.title_translations->>'pl' IS DISTINCT FROM OLD.title_translations->>'pl' THEN
    -- Zaktualizuj flagi dla pozostałych języków
    NEW.title_translations = NEW.title_translations
      || '{"de": {"status": "needs_review"}}'::jsonb
      || '{"fr": {"status": "needs_review"}}'::jsonb
      || '{"en": {"status": "needs_review"}}'::jsonb
      || '{"it": {"status": "needs_review"}}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_listing_update_trigger
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.handle_listing_translation_update();