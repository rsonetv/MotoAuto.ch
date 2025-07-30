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
