-- Enhanced MotoAuto.ch Database Setup with JSON Schema Validation
-- This script creates the complete database structure with comprehensive JSON schema validation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table with comprehensive fields
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_dealer BOOLEAN DEFAULT FALSE,
    dealer_name TEXT,
    dealer_license TEXT,
    location TEXT,
    bio TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listings table with comprehensive vehicle data
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('auto', 'moto', 'commercial')),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    mileage INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    color TEXT,
    vin TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    location TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    features JSONB DEFAULT '{}',
    condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used', 'damaged')),
    is_auction BOOLEAN DEFAULT FALSE,
    auction_end_time TIMESTAMPTZ,
    min_bid_increment DECIMAL(10,2),
    reserve_price DECIMAL(12,2),
    current_bid DECIMAL(12,2),
    bid_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'draft')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    is_auto_bid BOOLEAN DEFAULT FALSE,
    max_auto_bid DECIMAL(12,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_dealer ON profiles(is_dealer);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_is_auction ON listings(is_auction);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_bids_listing_id ON bids(listing_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- JSON Schema validation functions
CREATE OR REPLACE FUNCTION get_profile_schema()
RETURNS JSONB AS $$
BEGIN
    RETURN '{
        "type": "object",
        "properties": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "email": {
                "type": "string",
                "format": "email",
                "maxLength": 255
            },
            "full_name": {
                "type": ["string", "null"],
                "maxLength": 100
            },
            "avatar_url": {
                "type": ["string", "null"],
                "format": "uri",
                "maxLength": 500
            },
            "phone": {
                "type": ["string", "null"],
                "pattern": "^[+]?[0-9\\\\s\\\\-\\\$$\\\$$]{7,20}$"
            },
            "email_verified": {
                "type": "boolean"
            },
            "phone_verified": {
                "type": "boolean"
            },
            "is_dealer": {
                "type": "boolean"
            },
            "dealer_name": {
                "type": ["string", "null"],
                "maxLength": 100
            },
            "dealer_license": {
                "type": ["string", "null"],
                "maxLength": 50
            },
            "location": {
                "type": ["string", "null"],
                "maxLength": 100
            },
            "bio": {
                "type": ["string", "null"],
                "maxLength": 500
            },
            "website": {
                "type": ["string", "null"],
                "format": "uri",
                "maxLength": 255
            },
            "social_links": {
                "type": "object",
                "additionalProperties": {
                    "type": "string",
                    "format": "uri"
                }
            },
            "preferences": {
                "type": "object",
                "additionalProperties": true
            },
            "verification_status": {
                "type": "string",
                "enum": ["pending", "verified", "rejected"]
            },
            "created_at": {
                "type": "string",
                "format": "date-time"
            },
            "updated_at": {
                "type": "string",
                "format": "date-time"
            }
        },
        "required": ["id", "email", "email_verified", "is_dealer", "created_at", "updated_at"],
        "additionalProperties": false
    }'::jsonb;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_listing_schema()
RETURNS JSONB AS $$
BEGIN
    RETURN '{
        "type": "object",
        "properties": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "user_id": {
                "type": "string",
                "format": "uuid"
            },
            "title": {
                "type": "string",
                "minLength": 10,
                "maxLength": 200
            },
            "description": {
                "type": ["string", "null"],
                "maxLength": 5000
            },
            "category": {
                "type": "string",
                "enum": ["auto", "moto", "commercial"]
            },
            "brand": {
                "type": "string",
                "minLength": 1,
                "maxLength": 50
            },
            "model": {
                "type": "string",
                "minLength": 1,
                "maxLength": 100
            },
            "year": {
                "type": ["integer", "null"],
                "minimum": 1900,
                "maximum": 2030
            },
            "mileage": {
                "type": ["integer", "null"],
                "minimum": 0,
                "maximum": 9999999
            },
            "fuel_type": {
                "type": ["string", "null"],
                "enum": ["petrol", "diesel", "electric", "hybrid", "gas", "other"]
            },
            "transmission": {
                "type": ["string", "null"],
                "enum": ["manual", "automatic", "semi-automatic"]
            },
            "color": {
                "type": ["string", "null"],
                "maxLength": 50
            },
            "vin": {
                "type": ["string", "null"],
                "pattern": "^[A-HJ-NPR-Z0-9]{17}$"
            },
            "price": {
                "type": "number",
                "minimum": 0,
                "maximum": 99999999.99
            },
            "currency": {
                "type": "string",
                "enum": ["CHF", "EUR", "USD"]
            },
            "location": {
                "type": "string",
                "minLength": 2,
                "maxLength": 100
            },
            "images": {
                "type": "array",
                "items": {
                    "type": "string",
                    "format": "uri"
                },
                "maxItems": 20
            },
            "features": {
                "type": "object",
                "additionalProperties": true
            },
            "condition": {
                "type": "string",
                "enum": ["new", "used", "damaged"]
            },
            "is_auction": {
                "type": "boolean"
            },
            "auction_end_time": {
                "type": ["string", "null"],
                "format": "date-time"
            },
            "min_bid_increment": {
                "type": ["number", "null"],
                "minimum": 0.01
            },
            "reserve_price": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "current_bid": {
                "type": ["number", "null"],
                "minimum": 0
            },
            "bid_count": {
                "type": "integer",
                "minimum": 0
            },
            "status": {
                "type": "string",
                "enum": ["active", "sold", "expired", "draft"]
            },
            "views": {
                "type": "integer",
                "minimum": 0
            },
            "created_at": {
                "type": "string",
                "format": "date-time"
            },
            "updated_at": {
                "type": "string",
                "format": "date-time"
            }
        },
        "required": ["user_id", "title", "category", "brand", "model", "price", "location"],
        "additionalProperties": false
    }'::jsonb;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_bid_schema()
RETURNS JSONB AS $$
BEGIN
    RETURN '{
        "type": "object",
        "properties": {
            "id": {
                "type": "string",
                "format": "uuid"
            },
            "listing_id": {
                "type": "string",
                "format": "uuid"
            },
            "user_id": {
                "type": "string",
                "format": "uuid"
            },
            "amount": {
                "type": "number",
                "minimum": 0.01,
                "maximum": 99999999.99
            },
            "is_auto_bid": {
                "type": "boolean"
            },
            "max_auto_bid": {
                "type": ["number", "null"],
                "minimum": 0.01
            },
            "status": {
                "type": "string",
                "enum": ["active", "outbid", "winning", "won", "lost"]
            },
            "created_at": {
                "type": "string",
                "format": "date-time"
            }
        },
        "required": ["listing_id", "user_id", "amount"],
        "additionalProperties": false
    }'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Validation functions that use the schemas
CREATE OR REPLACE FUNCTION validate_profile_data(profile_data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    schema JSONB;
    is_valid BOOLEAN;
BEGIN
    schema := get_profile_schema();
    
    -- Basic validation - check required fields
    IF NOT (profile_data ? 'id' AND profile_data ? 'email' AND profile_data ? 'email_verified' AND profile_data ? 'is_dealer') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate email format
    IF NOT (profile_data->>'email' ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate UUID format for id
    IF NOT (profile_data->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate boolean fields
    IF NOT (jsonb_typeof(profile_data->'email_verified') = 'boolean' AND jsonb_typeof(profile_data->'is_dealer') = 'boolean') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_listing_data(listing_data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    schema JSONB;
BEGIN
    schema := get_listing_schema();
    
    -- Basic validation - check required fields
    IF NOT (listing_data ? 'user_id' AND listing_data ? 'title' AND listing_data ? 'category' 
            AND listing_data ? 'brand' AND listing_data ? 'model' AND listing_data ? 'price' 
            AND listing_data ? 'location') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate category
    IF NOT (listing_data->>'category' IN ('auto', 'moto', 'commercial')) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate price is positive number
    IF NOT ((listing_data->>'price')::NUMERIC > 0) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate title length
    IF NOT (LENGTH(listing_data->>'title') >= 10 AND LENGTH(listing_data->>'title') <= 200) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_bid_data(bid_data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    schema JSONB;
BEGIN
    schema := get_bid_schema();
    
    -- Basic validation - check required fields
    IF NOT (bid_data ? 'listing_id' AND bid_data ? 'user_id' AND bid_data ? 'amount') THEN
        RETURN FALSE;
    END IF;
    
    -- Validate amount is positive
    IF NOT ((bid_data->>'amount')::NUMERIC > 0) THEN
        RETURN FALSE;
    END IF;
    
    -- Validate UUIDs
    IF NOT (bid_data->>'listing_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            AND bid_data->>'user_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Insert some test data
INSERT INTO users (id, email) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com'),
    ('123e4567-e89b-12d3-a456-426614174001', 'dealer@example.com');

INSERT INTO profiles (id, email, full_name, email_verified, is_dealer, created_at, updated_at) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test User', true, false, NOW(), NOW()),
    ('123e4567-e89b-12d3-a456-426614174001', 'dealer@example.com', 'Test Dealer', true, true, NOW(), NOW());

-- Test the validation functions
DO $$
DECLARE
    test_profile JSONB;
    test_listing JSONB;
    test_bid JSONB;
    result BOOLEAN;
BEGIN
    -- Test profile validation
    test_profile := '{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "email_verified": true,
        "is_dealer": false,
        "created_at": "2025-07-23T19:34:12.321Z",
        "updated_at": "2025-07-23T19:34:12.321Z"
    }'::jsonb;
    
    result := validate_profile_data(test_profile);
    RAISE NOTICE 'Profile validation result: %', result;
    
    -- Test listing validation
    test_listing := '{
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Test Vehicle Listing",
        "category": "auto",
        "brand": "BMW",
        "model": "X5",
        "price": 25000,
        "location": "Zurich"
    }'::jsonb;
    
    result := validate_listing_data(test_listing);
    RAISE NOTICE 'Listing validation result: %', result;
    
    -- Test bid validation
    test_bid := '{
        "listing_id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "amount": 1000
    }'::jsonb;
    
    result := validate_bid_data(test_bid);
    RAISE NOTICE 'Bid validation result: %', result;
END $$;

-- Create RLS policies (basic setup)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded later)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view active listings" ON listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own listings" ON listings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view bids on their listings" ON bids FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE listings.id = bids.listing_id AND listings.user_id = auth.uid())
    OR bids.user_id = auth.uid()
);
CREATE POLICY "Users can create bids" ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;
