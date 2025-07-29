-- Check and fix the listings table ID type issue
DO $$
DECLARE
    column_type TEXT;
BEGIN
    -- Check if the listings table exists and what type its id column is
    SELECT data_type INTO column_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'listings' 
      AND column_name = 'id';
    
    IF column_type = 'integer' THEN
        RAISE NOTICE 'Found listings table with integer id. This is causing foreign key conflicts and needs to be fixed.';
        
        -- Drop dependent tables first
        DROP TABLE IF EXISTS public.contact_messages CASCADE;
        DROP TABLE IF EXISTS public.payments CASCADE;
        DROP TABLE IF EXISTS public.bids CASCADE;
        DROP TABLE IF EXISTS public.watchlist CASCADE;
        
        -- Drop the existing listings table with integer id
        DROP TABLE IF EXISTS public.listings CASCADE;
        
        RAISE NOTICE 'Dropped existing listings table with integer id and all dependent tables.';
    ELSIF column_type IS NOT NULL THEN
        RAISE NOTICE 'Existing listings table has id of type %', column_type;
    ELSE
        RAISE NOTICE 'No existing listings table found, will proceed with creating a new one.';
    END IF;
END $$;

-- Now recreate listings table with UUID primary key
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

-- Now we can create the payments table with the correct foreign key reference
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

-- Recreate other dependent tables that reference listings
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

CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create contact_messages table which also references listings
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
