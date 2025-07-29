-- Fixed migrations for MotoAuto.ch
-- This script drops and recreates tables to fix type incompatibility issues

-- First, check for and drop any existing tables that might cause conflicts
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.contact_categories CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.watchlist CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
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
CREATE TABLE public.categories (
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
CREATE TABLE public.packages (
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

-- Create listings table - IMPORTANT: This ID MUST be UUID
CREATE TABLE public.listings (
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
CREATE TABLE public.bids (
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
CREATE TABLE public.payments (
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
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_is_dealer ON public.profiles(is_dealer);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_packages_is_active ON public.packages(is_active);
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_sale_type ON public.listings(sale_type);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_bids_listing_id ON public.bids(listing_id);
CREATE INDEX idx_bids_user_id ON public.bids(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);

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

-- Database functions
-- Create database functions for MotoAuto.ch

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

-- Contact tables
-- Create contact-related tables

-- Create contact_categories table
CREATE TABLE public.contact_categories (
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
CREATE TABLE public.contact_messages (
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
CREATE INDEX contact_messages_user_id_idx ON public.contact_messages (user_id);
CREATE INDEX contact_messages_status_idx ON public.contact_messages (status);
CREATE INDEX contact_messages_category_idx ON public.contact_messages (category);
CREATE INDEX contact_messages_listing_id_idx ON public.contact_messages (listing_id);

-- Create admin_users table for managing admin access
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for admin_users
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);

-- Create trigger for admin_users updated_at
CREATE TRIGGER admin_users_updated_at 
  BEFORE UPDATE ON public.admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admin users are viewable by super admins" 
  ON public.admin_users FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_super_admin = true)
  );

CREATE POLICY "Admin users are manageable by super admins" 
  ON public.admin_users FOR ALL TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_super_admin = true)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_super_admin = true)
  );

-- Contact categories policies (public read, admin write)
CREATE POLICY "Contact categories are viewable by everyone" 
  ON public.contact_categories FOR SELECT USING (true);

CREATE POLICY "Contact categories are insertable by admins only" 
  ON public.contact_categories FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Contact categories are updatable by admins only" 
  ON public.contact_categories FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Contact categories are deletable by admins only" 
  ON public.contact_categories FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Contact messages policies
CREATE POLICY "Contact messages are viewable by admins and the message sender" 
  ON public.contact_messages FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users) OR
    auth.uid() = user_id
  );

CREATE POLICY "Contact messages are insertable by everyone" 
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Contact messages are updatable by admins only" 
  ON public.contact_messages FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Contact messages are deletable by admins only" 
  ON public.contact_messages FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

-- Create trigger for updated_at
CREATE TRIGGER set_contact_categories_updated_at
BEFORE UPDATE ON public.contact_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed data
-- Seed data for MotoAuto.ch

-- Insert categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Samochody', 'auta', 'Samochody osobowe, terenowe, sportowe i inne', 'car', 1),
  ('Motocykle', 'moto', 'Motocykle, skutery, quady i pojazdy dwukołowe', 'bike', 2),
  ('Części samochodowe', 'parts', 'Części zamienne do samochodów', 'wrench', 3),
  ('Akcesoria motoryzacyjne', 'accessories', 'Akcesoria i wyposażenie dla pojazdów', 'tool', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Insert packages
INSERT INTO public.packages (name, price, duration_days, max_images, description, features, is_popular) VALUES
  (
    'Darmowy', 
    0.00, 
    30, 
    5, 
    'Pierwsze ogłoszenie za darmo - idealne na start!',
    '{"basic_support": true, "standard_listing": true}',
    false
  ),
  (
    'Premium', 
    29.90, 
    60, 
    15, 
    'Rozszerzony pakiet z większą widocznością i priorytetem w wyszukiwaniu',
    '{"featured_listing": true, "priority_support": true, "extended_duration": true, "more_photos": true}',
    true
  ),
  (
    'Dealer', 
    99.90, 
    90, 
    30, 
    'Profesjonalny pakiet dla dealerów z pełną funkcjonalnością',
    '{"featured_listing": true, "priority_support": true, "analytics": true, "dealer_badge": true, "unlimited_editing": true, "social_media_promotion": true, "multiple_categories": true}',
    false
  )
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  max_images = EXCLUDED.max_images,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular;

-- Grant necessary permissions for functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_listing_views(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_listing_bid(UUID, DECIMAL, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_listings(TEXT, TEXT, DECIMAL, DECIMAL, TEXT, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated, anon;

-- Insert an initial super admin user (you can update this later)
INSERT INTO public.admin_users (id, username, email, is_super_admin)
VALUES (
  'f9e8d7c6-b5a4-3f2e-1d0c-9b8a7c6d5e4f',
  'admin',
  'admin@motoauto.ch',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Insert contact categories
INSERT INTO public.contact_categories (id, slug, name, name_de, name_fr, name_en, name_pl, description, icon, email_recipient, position)
VALUES (
    '2f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d2',
    'general_inquiry',
    'Zapytanie ogólne',
    'Allgemeine Anfrage',
    'Demande générale',
    'General Inquiry',
    'Zapytanie ogólne',
    'Pytania ogólne dotyczące platformy MotoAuto.ch',
    'help-circle',
    'kontakt@motoauto.ch',
    1
  ),
  (
    '3f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d3',
    'technical_support',
    'Wsparcie techniczne',
    'Technischer Support',
    'Support technique',
    'Technical Support',
    'Wsparcie techniczne',
    'Problemy techniczne z platformą MotoAuto.ch',
    'tool',
    'support@motoauto.ch',
    2
  ),
  (
    '4f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d4',
    'listing_inquiry',
    'Pytanie o ogłoszenie',
    'Anzeigenanfrage',
    'Demande d''annonce',
    'Listing Inquiry',
    'Pytanie o ogłoszenie',
    'Pytania dotyczące konkretnego ogłoszenia',
    'clipboard',
    'ogloszenia@motoauto.ch',
    3
  ),
  (
    '5f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d5',
    'auction_inquiry',
    'Pytanie o aukcję',
    'Auktionsanfrage',
    'Demande d''enchère',
    'Auction Inquiry',
    'Pytanie o aukcję',
    'Pytania dotyczące konkretnej aukcji',
    'gavel',
    'aukcje@motoauto.ch',
    4
  ),
  (
    '6f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d6',
    'billing_inquiry',
    'Pytanie o płatności',
    'Zahlungsanfrage',
    'Demande de paiement',
    'Billing Inquiry',
    'Pytanie o płatności',
    'Pytania dotyczące płatności, faktur i abonamentów',
    'credit-card',
    'platnosci@motoauto.ch',
    5
  ),
  (
    '7f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d7',
    'dealer_inquiry',
    'Współpraca dla dealerów',
    'Händlerkooperation',
    'Coopération avec les concessionnaires',
    'Dealer Cooperation',
    'Współpraca dla dealerów',
    'Pytania dotyczące współpracy dla dealerów samochodowych',
    'briefcase',
    'dealerzy@motoauto.ch',
    6
  ),
  (
    '8f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d8',
    'partnership',
    'Partnerstwo biznesowe',
    'Geschäftspartnerschaft',
    'Partenariat commercial',
    'Business Partnership',
    'Partnerstwo biznesowe',
    'Propozycje współpracy biznesowej',
    'handshake',
    'biznes@motoauto.ch',
    7
  ),
  (
    '9f8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3d9',
    'feedback',
    'Opinie i sugestie',
    'Feedback und Vorschläge',
    'Commentaires et suggestions',
    'Feedback and Suggestions',
    'Opinie i sugestie',
    'Opinie i sugestie dotyczące platformy MotoAuto.ch',
    'message-square',
    'feedback@motoauto.ch',
    8
  ),
  (
    'af8e9b5c-d7a4-4f1d-a8b3-c6e7d5f4e3da',
    'other',
    'Inne',
    'Andere',
    'Autre',
    'Other',
    'Inne',
    'Inne pytania',
    'help-circle',
    'kontakt@motoauto.ch',
    9
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_de = EXCLUDED.name_de,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  name_pl = EXCLUDED.name_pl,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  email_recipient = EXCLUDED.email_recipient,
  position = EXCLUDED.position;
