-- MotoAuto.ch - Complete Database Schema
-- Comprehensive schema with all required tables for Swiss automotive marketplace
-- Supports multilingual content (PL/DE/FR), CHF currency, and Swiss market requirements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS packages CASCADE;

-- =========================
-- 1. CATEGORIES TABLE
-- =========================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_pl TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    description_en TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_pl TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2. PACKAGES TABLE
-- =========================
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_de TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_pl TEXT NOT NULL,
    description_en TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_pl TEXT,
    price_chf NUMERIC(10,2) NOT NULL CHECK (price_chf >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    features JSONB DEFAULT '{}'::jsonb,
    max_images INTEGER DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 3. PROFILES TABLE (extends Supabase auth.users)
-- =========================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    is_dealer BOOLEAN DEFAULT false,
    dealer_name TEXT,
    dealer_license TEXT,
    dealer_vat_number TEXT,
    company_address TEXT,
    location TEXT,
    postal_code TEXT,
    canton TEXT,
    country TEXT DEFAULT 'CH',
    bio TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    preferred_language TEXT DEFAULT 'de' CHECK (preferred_language IN ('de', 'fr', 'pl', 'en')),
    notification_preferences JSONB DEFAULT '{
        "email_new_bids": true,
        "email_auction_ending": true,
        "email_outbid": true,
        "email_marketing": false,
        "sms_auction_ending": false,
        "sms_outbid": false
    }'::jsonb,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB DEFAULT '{}'::jsonb,
    free_listings_used INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 4. LISTINGS TABLE
-- =========================
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    
    -- Basic Information
    title TEXT NOT NULL CHECK (length(title) >= 10 AND length(title) <= 200),
    description TEXT CHECK (length(description) <= 5000),
    
    -- Vehicle Details
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
    mileage INTEGER CHECK (mileage >= 0),
    engine_capacity NUMERIC(4,2) CHECK (engine_capacity > 0),
    power_hp INTEGER CHECK (power_hp > 0),
    power_kw INTEGER CHECK (power_kw > 0),
    fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'gas', 'other')),
    transmission TEXT CHECK (transmission IN ('manual', 'automatic', 'semi-automatic')),
    drivetrain TEXT CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
    color TEXT,
    interior_color TEXT,
    vin TEXT CHECK (vin IS NULL OR vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
    
    -- Condition & History
    condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used', 'damaged')),
    accident_free BOOLEAN DEFAULT true,
    owners_count INTEGER DEFAULT 1 CHECK (owners_count >= 1),
    has_service_book BOOLEAN DEFAULT false,
    last_service_km INTEGER,
    last_service_date DATE,
    next_service_due_km INTEGER,
    next_service_due_date DATE,
    
    -- Pricing
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD')),
    price_negotiable BOOLEAN DEFAULT false,
    financing_available BOOLEAN DEFAULT false,
    leasing_available BOOLEAN DEFAULT false,
    
    -- Location
    location TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    canton TEXT,
    country TEXT DEFAULT 'CH',
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    
    -- Media & Features
    images TEXT[] DEFAULT '{}' CHECK (array_length(images, 1) <= 50),
    video_url TEXT,
    features JSONB DEFAULT '{}'::jsonb,
    equipment JSONB DEFAULT '{}'::jsonb,
    
    -- Auction Settings
    is_auction BOOLEAN DEFAULT false,
    auction_end_time TIMESTAMPTZ,
    min_bid_increment NUMERIC(10,2) DEFAULT 100.00 CHECK (min_bid_increment > 0),
    reserve_price NUMERIC(12,2) CHECK (reserve_price >= 0),
    current_bid NUMERIC(12,2) DEFAULT 0,
    bid_count INTEGER DEFAULT 0,
    auto_extend_minutes INTEGER DEFAULT 5 CHECK (auto_extend_minutes >= 0),
    
    -- Status & Metrics
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'suspended')),
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_auction_settings CHECK (
        (is_auction = false) OR 
        (is_auction = true AND auction_end_time IS NOT NULL AND auction_end_time > NOW())
    ),
    CONSTRAINT valid_reserve_price CHECK (
        (is_auction = false) OR 
        (reserve_price IS NULL OR reserve_price <= price)
    )
);

-- =========================
-- 5. AUCTIONS TABLE (additional auction-specific data)
-- =========================
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    starting_price NUMERIC(12,2) NOT NULL CHECK (starting_price >= 0),
    reserve_met BOOLEAN DEFAULT false,
    winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    winning_bid NUMERIC(12,2),
    total_bids INTEGER DEFAULT 0,
    unique_bidders INTEGER DEFAULT 0,
    extended_count INTEGER DEFAULT 0,
    max_extensions INTEGER DEFAULT 10,
    ended_at TIMESTAMPTZ,
    payment_due_date TIMESTAMPTZ,
    payment_received BOOLEAN DEFAULT false,
    pickup_arranged BOOLEAN DEFAULT false,
    feedback_left BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 6. BIDS TABLE
-- =========================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    
    -- Auto-bidding features
    is_auto_bid BOOLEAN DEFAULT false,
    max_auto_bid NUMERIC(12,2) CHECK (max_auto_bid IS NULL OR max_auto_bid >= amount),
    auto_bid_active BOOLEAN DEFAULT false,
    
    -- Bid status and metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost', 'retracted')),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure user cannot bid on own listing
    CONSTRAINT no_self_bidding CHECK (
        user_id != (SELECT user_id FROM listings WHERE id = listing_id)
    )
);

-- =========================
-- 7. PAYMENTS TABLE
-- =========================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'CHF' CHECK (currency IN ('CHF', 'EUR', 'USD')),
    commission_rate NUMERIC(5,4) DEFAULT 0.05 CHECK (commission_rate >= 0 AND commission_rate <= 1),
    commission_amount NUMERIC(12,2) DEFAULT 0 CHECK (commission_amount >= 0),
    max_commission NUMERIC(12,2) DEFAULT 500.00,
    
    -- Payment Method & Status
    payment_method TEXT CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'twint', 'postfinance')),
    payment_provider TEXT, -- stripe, paypal, etc.
    payment_provider_id TEXT, -- external payment ID
    
    -- Status & Type
    payment_type TEXT NOT NULL CHECK (payment_type IN ('listing_fee', 'commission', 'premium_package', 'featured_listing', 'refund')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    
    -- Timestamps
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 8. INDEXES FOR PERFORMANCE
-- =========================

-- Categories indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Packages indexes
CREATE INDEX idx_packages_active ON packages(is_active);
CREATE INDEX idx_packages_price ON packages(price_chf);

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_postal_code ON profiles(postal_code);
CREATE INDEX idx_profiles_is_dealer ON profiles(is_dealer);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

-- Listings indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_is_auction ON listings(is_auction);
CREATE INDEX idx_listings_brand_model ON listings(brand, model);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_postal_code ON listings(postal_code);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_year ON listings(year);
CREATE INDEX idx_listings_mileage ON listings(mileage);
CREATE INDEX idx_listings_fuel_type ON listings(fuel_type);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_published_at ON listings(published_at DESC);
CREATE INDEX idx_listings_auction_end ON listings(auction_end_time) WHERE is_auction = true;
CREATE INDEX idx_listings_active_auctions ON listings(status, is_auction, auction_end_time) WHERE status = 'active' AND is_auction = true;

-- Full-text search indexes
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('german', title || ' ' || description || ' ' || brand || ' ' || model));

-- Auctions indexes
CREATE INDEX idx_auctions_listing_id ON auctions(listing_id);
CREATE INDEX idx_auctions_winner_id ON auctions(winner_id);
CREATE INDEX idx_auctions_ended_at ON auctions(ended_at DESC);

-- Bids indexes
CREATE INDEX idx_bids_listing_id ON bids(listing_id);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_amount ON bids(amount DESC);
CREATE INDEX idx_bids_placed_at ON bids(placed_at DESC);
CREATE INDEX idx_bids_status ON bids(status);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_listing_id ON payments(listing_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_provider_id ON payments(payment_provider_id);

-- =========================
-- 9. TRIGGER FUNCTIONS
-- =========================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update listing bid count and current bid
CREATE OR REPLACE FUNCTION update_listing_bid_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings 
        SET 
            current_bid = NEW.amount,
            bid_count = bid_count + 1
        WHERE id = NEW.listing_id;
        
        UPDATE auctions 
        SET 
            total_bids = total_bids + 1,
            unique_bidders = (
                SELECT COUNT(DISTINCT user_id) 
                FROM bids 
                WHERE auction_id = NEW.auction_id
            )
        WHERE id = NEW.auction_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to handle auction extensions
CREATE OR REPLACE FUNCTION check_auction_extension()
RETURNS TRIGGER AS $$
DECLARE
    auction_end TIMESTAMPTZ;
    extend_minutes INTEGER;
    current_extensions INTEGER;
    max_extensions INTEGER;
BEGIN
    -- Get auction details
    SELECT l.auction_end_time, l.auto_extend_minutes, a.extended_count, a.max_extensions
    INTO auction_end, extend_minutes, current_extensions, max_extensions
    FROM listings l
    JOIN auctions a ON a.listing_id = l.id
    WHERE l.id = NEW.listing_id;
    
    -- Check if bid is placed within extension window and extensions are allowed
    IF auction_end - NOW() <= INTERVAL '1 minute' * extend_minutes 
       AND current_extensions < max_extensions THEN
        
        -- Extend auction
        UPDATE listings 
        SET auction_end_time = auction_end + INTERVAL '1 minute' * extend_minutes
        WHERE id = NEW.listing_id;
        
        UPDATE auctions 
        SET extended_count = extended_count + 1
        WHERE listing_id = NEW.listing_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(sale_amount NUMERIC, rate NUMERIC DEFAULT 0.05, max_commission NUMERIC DEFAULT 500.00)
RETURNS NUMERIC AS $$
BEGIN
    RETURN LEAST(sale_amount * rate, max_commission);
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 10. TRIGGERS
-- =========================

-- Updated_at triggers
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auctions_updated_at
    BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bid-related triggers
CREATE TRIGGER trg_update_bid_stats
    AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION update_listing_bid_stats();

CREATE TRIGGER trg_check_auction_extension
    AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION check_auction_extension();

-- =========================
-- 11. ROW LEVEL SECURITY (RLS)
-- =========================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "categories_select_all" ON categories
    FOR SELECT USING (is_active = true);

-- Packages policies (public read)
CREATE POLICY "packages_select_all" ON packages
    FOR SELECT USING (is_active = true);

-- Profiles policies
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings policies
CREATE POLICY "listings_select_active" ON listings
    FOR SELECT USING (
        status IN ('active', 'sold') OR 
        auth.uid() = user_id
    );

CREATE POLICY "listings_insert_own" ON listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_update_own" ON listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "listings_delete_own" ON listings
    FOR DELETE USING (auth.uid() = user_id);

-- Auctions policies
CREATE POLICY "auctions_select_with_listing" ON auctions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = auctions.listing_id 
            AND (listings.status IN ('active', 'sold') OR listings.user_id = auth.uid())
        )
    );

CREATE POLICY "auctions_manage_own" ON auctions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = auctions.listing_id 
            AND listings.user_id = auth.uid()
        )
    );

-- Bids policies
CREATE POLICY "bids_select_relevant" ON bids
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = bids.listing_id 
            AND listings.user_id = auth.uid()
        )
    );

CREATE POLICY "bids_insert_valid" ON bids
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() != (SELECT user_id FROM listings WHERE id = listing_id) AND
        EXISTS (
            SELECT 1 FROM listings 
            WHERE id = listing_id 
            AND status = 'active' 
            AND is_auction = true 
            AND auction_end_time > NOW()
        )
    );

-- Payments policies
CREATE POLICY "payments_select_own" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================
-- 12. INITIAL DATA
-- =========================

-- Insert default categories
INSERT INTO categories (name_en, name_de, name_fr, name_pl, slug, sort_order) VALUES
('Cars', 'Autos', 'Voitures', 'Samochody', 'cars', 1),
('Motorcycles', 'Motorräder', 'Motos', 'Motocykle', 'motorcycles', 2),
('Commercial Vehicles', 'Nutzfahrzeuge', 'Véhicules utilitaires', 'Pojazdy użytkowe', 'commercial', 3),
('Parts & Accessories', 'Teile & Zubehör', 'Pièces et accessoires', 'Części i akcesoria', 'parts', 4);

-- Insert subcategories for cars
INSERT INTO categories (name_en, name_de, name_fr, name_pl, slug, parent_id, sort_order) 
SELECT 'Sedans', 'Limousinen', 'Berlines', 'Sedany', 'sedans', id, 1 FROM categories WHERE slug = 'cars';

INSERT INTO categories (name_en, name_de, name_fr, name_pl, slug, parent_id, sort_order) 
SELECT 'SUVs', 'SUVs', 'SUV', 'SUV-y', 'suvs', id, 2 FROM categories WHERE slug = 'cars';

INSERT INTO categories (name_en, name_de, name_fr, name_pl, slug, parent_id, sort_order) 
SELECT 'Sports Cars', 'Sportwagen', 'Voitures de sport', 'Samochody sportowe', 'sports-cars', id, 3 FROM categories WHERE slug = 'cars';

-- Insert default packages
INSERT INTO packages (name_en, name_de, name_fr, name_pl, price_chf, duration_days, features, max_images) VALUES
('Free Listing', 'Kostenlose Anzeige', 'Annonce gratuite', 'Darmowe ogłoszenie', 0.00, 30, '{"basic": true}', 5),
('Premium Listing', 'Premium Anzeige', 'Annonce premium', 'Ogłoszenie premium', 29.90, 60, '{"featured": true, "highlighted": true}', 15),
('Dealer Package', 'Händler Paket', 'Package concessionnaire', 'Pakiet dealera', 99.90, 90, '{"unlimited_listings": true, "priority_support": true}', 25);

COMMIT;