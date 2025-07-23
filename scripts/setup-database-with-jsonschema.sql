-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";

-- JSON Schema definitions for data validation
CREATE OR REPLACE FUNCTION get_profile_schema() RETURNS jsonb AS $$
BEGIN
  RETURN '{
    "type": "object",
    "properties": {
      "id": {"type": "string", "format": "uuid"},
      "email": {"type": "string", "format": "email", "maxLength": 255},
      "full_name": {"type": ["string", "null"], "maxLength": 100},
      "avatar_url": {"type": ["string", "null"], "format": "uri", "maxLength": 500},
      "phone": {"type": ["string", "null"], "pattern": "^[+]?[0-9\\s\\-\$$\$$]{7,20}$"},
      "email_verified": {"type": "boolean"},
      "is_dealer": {"type": "boolean"},
      "dealer_name": {"type": ["string", "null"], "maxLength": 100},
      "dealer_license": {"type": ["string", "null"], "maxLength": 50},
      "created_at": {"type": "string", "format": "date-time"},
      "updated_at": {"type": "string", "format": "date-time"}
    },
    "required": ["id", "email", "email_verified", "is_dealer", "created_at", "updated_at"],
    "additionalProperties": false
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_listing_schema() RETURNS jsonb AS $$
BEGIN
  RETURN '{
    "type": "object",
    "properties": {
      "id": {"type": "integer", "minimum": 1},
      "user_id": {"type": "string", "format": "uuid"},
      "title": {"type": "string", "minLength": 10, "maxLength": 200},
      "description": {"type": ["string", "null"], "maxLength": 10000},
      "price": {"type": "number", "minimum": 0, "maximum": 10000000},
      "current_bid": {"type": ["number", "null"], "minimum": 0},
      "category": {"type": "string", "enum": ["auto", "moto", "commercial"]},
      "brand": {"type": "string", "minLength": 1, "maxLength": 50},
      "model": {"type": "string", "minLength": 1, "maxLength": 50},
      "year": {"type": ["integer", "null"], "minimum": 1900, "maximum": 2030},
      "mileage": {"type": ["integer", "null"], "minimum": 0, "maximum": 2000000},
      "engine_capacity": {"type": ["number", "null"], "minimum": 0, "maximum": 20},
      "power": {"type": ["integer", "null"], "minimum": 0, "maximum": 2000},
      "fuel_type": {"type": ["string", "null"], "enum": ["petrol", "diesel", "electric", "hybrid", "lpg", "cng", "other"]},
      "transmission": {"type": ["string", "null"], "enum": ["manual", "automatic", "semi-automatic", "cvt"]},
      "drive_type": {"type": ["string", "null"], "enum": ["fwd", "rwd", "awd", "4wd"]},
      "body_type": {"type": ["string", "null"], "enum": ["sedan", "hatchback", "suv", "coupe", "convertible", "wagon", "pickup", "van", "other"]},
      "doors": {"type": ["integer", "null"], "minimum": 2, "maximum": 5},
      "seats": {"type": ["integer", "null"], "minimum": 1, "maximum": 9},
      "color": {"type": ["string", "null"], "maxLength": 30},
      "vin": {"type": ["string", "null"], "pattern": "^[A-HJ-NPR-Z0-9]{17}$"},
      "condition": {"type": ["string", "null"], "enum": ["new", "used", "damaged", "parts"]},
      "accident_free": {"type": "boolean"},
      "owners_count": {"type": "integer", "minimum": 0, "maximum": 20},
      "has_service_book": {"type": "boolean"},
      "last_service_date": {"type": ["string", "null"], "format": "date"},
      "next_service_due": {"type": ["integer", "null"], "minimum": 0},
      "location": {"type": "string", "minLength": 2, "maxLength": 100},
      "postal_code": {"type": ["string", "null"], "pattern": "^[0-9]{4,6}$"},
      "latitude": {"type": ["number", "null"], "minimum": -90, "maximum": 90},
      "longitude": {"type": ["number", "null"], "minimum": -180, "maximum": 180},
      "images": {"type": ["array", "null"], "items": {"type": "string", "format": "uri"}, "maxItems": 20},
      "documents": {"type": ["array", "null"], "items": {"type": "string", "format": "uri"}, "maxItems": 10},
      "video_url": {"type": ["string", "null"], "format": "uri"},
      "is_auction": {"type": "boolean"},
      "auction_start_time": {"type": ["string", "null"], "format": "date-time"},
      "auction_end_time": {"type": ["string", "null"], "format": "date-time"},
      "reserve_price": {"type": ["number", "null"], "minimum": 0},
      "buy_now_price": {"type": ["number", "null"], "minimum": 0},
      "min_bid_increment": {"type": "number", "minimum": 1, "maximum": 10000},
      "auto_extend": {"type": "boolean"},
      "warranty_months": {"type": ["integer", "null"], "minimum": 0, "maximum": 120},
      "financing_available": {"type": "boolean"},
      "trade_in_accepted": {"type": "boolean"},
      "delivery_available": {"type": "boolean"},
      "status": {"type": "string", "enum": ["active", "sold", "expired", "draft", "suspended"]},
      "views": {"type": "integer", "minimum": 0},
      "favorites_count": {"type": "integer", "minimum": 0},
      "featured": {"type": "boolean"},
      "featured_until": {"type": ["string", "null"], "format": "date-time"},
      "created_at": {"type": "string", "format": "date-time"},
      "updated_at": {"type": "string", "format": "date-time"},
      "published_at": {"type": ["string", "null"], "format": "date-time"},
      "sold_at": {"type": ["string", "null"], "format": "date-time"}
    },
    "required": ["user_id", "title", "price", "category", "brand", "model", "location", "accident_free", "owners_count", "has_service_book", "is_auction", "min_bid_increment", "auto_extend", "financing_available", "trade_in_accepted", "delivery_available", "status", "views", "favorites_count", "featured", "created_at", "updated_at"],
    "additionalProperties": false
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_bid_schema() RETURNS jsonb AS $$
BEGIN
  RETURN '{
    "type": "object",
    "properties": {
      "id": {"type": "integer", "minimum": 1},
      "listing_id": {"type": "integer", "minimum": 1},
      "user_id": {"type": "string", "format": "uuid"},
      "amount": {"type": "number", "minimum": 0, "maximum": 10000000},
      "is_auto_bid": {"type": "boolean"},
      "max_auto_bid": {"type": ["number", "null"], "minimum": 0},
      "placed_at": {"type": "string", "format": "date-time"}
    },
    "required": ["listing_id", "user_id", "amount", "is_auto_bid", "placed_at"],
    "additionalProperties": false
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enhanced Profiles table with JSON schema validation
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  email_verified boolean DEFAULT false NOT NULL,
  is_dealer boolean DEFAULT false NOT NULL,
  dealer_name text,
  dealer_license text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Data integrity constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~* '^[+]?[0-9\s\-$$$$]{7,20}$'),
  CONSTRAINT valid_avatar_url CHECK (avatar_url IS NULL OR avatar_url ~* '^https?://'),
  CONSTRAINT valid_full_name_length CHECK (full_name IS NULL OR length(full_name) BETWEEN 1 AND 100),
  CONSTRAINT valid_dealer_name_length CHECK (dealer_name IS NULL OR length(dealer_name) BETWEEN 1 AND 100),
  CONSTRAINT valid_dealer_license_length CHECK (dealer_license IS NULL OR length(dealer_license) BETWEEN 1 AND 50),
  CONSTRAINT dealer_consistency CHECK (
    (is_dealer = false AND dealer_name IS NULL AND dealer_license IS NULL) OR
    (is_dealer = true)
  ),
  CONSTRAINT valid_timestamps CHECK (created_at <= updated_at),
  
  -- JSON schema validation
  CONSTRAINT profile_schema_valid CHECK (
    jsonb_matches_schema(
      get_profile_schema(),
      to_jsonb(profiles.*) - 'id'::text
    )
  )
);

-- Enhanced Listings table with comprehensive validation
CREATE TABLE IF NOT EXISTS listings (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  current_bid numeric(10,2),
  category text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer,
  mileage integer,
  engine_capacity numeric(4,2),
  power integer,
  fuel_type text,
  transmission text,
  drive_type text,
  body_type text,
  doors integer,
  seats integer,
  color text,
  vin text,
  condition text,
  accident_free boolean DEFAULT true NOT NULL,
  owners_count integer DEFAULT 1 NOT NULL,
  has_service_book boolean DEFAULT false NOT NULL,
  last_service_date date,
  next_service_due integer,
  location text NOT NULL,
  postal_code text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  images text[],
  documents text[],
  video_url text,
  is_auction boolean DEFAULT false NOT NULL,
  auction_start_time timestamp with time zone,
  auction_end_time timestamp with time zone,
  reserve_price numeric(10,2),
  buy_now_price numeric(10,2),
  min_bid_increment numeric(8,2) DEFAULT 1.00 NOT NULL,
  auto_extend boolean DEFAULT false NOT NULL,
  warranty_months integer,
  financing_available boolean DEFAULT false NOT NULL,
  trade_in_accepted boolean DEFAULT false NOT NULL,
  delivery_available boolean DEFAULT false NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  views integer DEFAULT 0 NOT NULL,
  favorites_count integer DEFAULT 0 NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  featured_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  published_at timestamp with time zone,
  sold_at timestamp with time zone,
  
  -- Data integrity constraints
  CONSTRAINT valid_title_length CHECK (length(title) BETWEEN 10 AND 200),
  CONSTRAINT valid_description_length CHECK (description IS NULL OR length(description) <= 10000),
  CONSTRAINT valid_price CHECK (price >= 0 AND price <= 10000000),
  CONSTRAINT valid_current_bid CHECK (current_bid IS NULL OR (current_bid >= 0 AND current_bid <= 10000000)),
  CONSTRAINT valid_category CHECK (category IN ('auto', 'moto', 'commercial')),
  CONSTRAINT valid_brand_length CHECK (length(brand) BETWEEN 1 AND 50),
  CONSTRAINT valid_model_length CHECK (length(model) BETWEEN 1 AND 50),
  CONSTRAINT valid_year CHECK (year IS NULL OR (year >= 1900 AND year <= 2030)),
  CONSTRAINT valid_mileage CHECK (mileage IS NULL OR (mileage >= 0 AND mileage <= 2000000)),
  CONSTRAINT valid_engine_capacity CHECK (engine_capacity IS NULL OR (engine_capacity >= 0 AND engine_capacity <= 20)),
  CONSTRAINT valid_power CHECK (power IS NULL OR (power >= 0 AND power <= 2000)),
  CONSTRAINT valid_fuel_type CHECK (fuel_type IS NULL OR fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other')),
  CONSTRAINT valid_transmission CHECK (transmission IS NULL OR transmission IN ('manual', 'automatic', 'semi-automatic', 'cvt')),
  CONSTRAINT valid_drive_type CHECK (drive_type IS NULL OR drive_type IN ('fwd', 'rwd', 'awd', '4wd')),
  CONSTRAINT valid_body_type CHECK (body_type IS NULL OR body_type IN ('sedan', 'hatchback', 'suv', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'other')),
  CONSTRAINT valid_doors CHECK (doors IS NULL OR (doors >= 2 AND doors <= 5)),
  CONSTRAINT valid_seats CHECK (seats IS NULL OR (seats >= 1 AND seats <= 9)),
  CONSTRAINT valid_color_length CHECK (color IS NULL OR length(color) <= 30),
  CONSTRAINT valid_vin CHECK (vin IS NULL OR vin ~* '^[A-HJ-NPR-Z0-9]{17}$'),
  CONSTRAINT valid_condition CHECK (condition IS NULL OR condition IN ('new', 'used', 'damaged', 'parts')),
  CONSTRAINT valid_owners_count CHECK (owners_count >= 0 AND owners_count <= 20),
  CONSTRAINT valid_next_service_due CHECK (next_service_due IS NULL OR next_service_due >= 0),
  CONSTRAINT valid_location_length CHECK (length(location) BETWEEN 2 AND 100),
  CONSTRAINT valid_postal_code CHECK (postal_code IS NULL OR postal_code ~* '^[0-9]{4,6}$'),
  CONSTRAINT valid_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  CONSTRAINT valid_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  CONSTRAINT valid_images_count CHECK (images IS NULL OR array_length(images, 1) <= 20),
  CONSTRAINT valid_documents_count CHECK (documents IS NULL OR array_length(documents, 1) <= 10),
  CONSTRAINT valid_video_url CHECK (video_url IS NULL OR video_url ~* '^https?://'),
  CONSTRAINT valid_reserve_price CHECK (reserve_price IS NULL OR (reserve_price >= 0 AND reserve_price <= 10000000)),
  CONSTRAINT valid_buy_now_price CHECK (buy_now_price IS NULL OR (buy_now_price >= 0 AND buy_now_price <= 10000000)),
  CONSTRAINT valid_min_bid_increment CHECK (min_bid_increment >= 1 AND min_bid_increment <= 10000),
  CONSTRAINT valid_warranty_months CHECK (warranty_months IS NULL OR (warranty_months >= 0 AND warranty_months <= 120)),
  CONSTRAINT valid_status CHECK (status IN ('active', 'sold', 'expired', 'draft', 'suspended')),
  CONSTRAINT valid_views CHECK (views >= 0),
  CONSTRAINT valid_favorites_count CHECK (favorites_count >= 0),
  CONSTRAINT valid_timestamps CHECK (created_at <= updated_at),
  CONSTRAINT valid_auction_times CHECK (
    (is_auction = false) OR 
    (is_auction = true AND auction_end_time IS NOT NULL AND auction_end_time > auction_start_time)
  ),
  CONSTRAINT valid_auction_pricing CHECK (
    (is_auction = false) OR
    (is_auction = true AND min_bid_increment > 0)
  ),
  CONSTRAINT valid_current_bid_vs_price CHECK (
    current_bid IS NULL OR 
    (is_auction = true AND current_bid >= price)
  ),
  CONSTRAINT valid_featured_until CHECK (
    (featured = false AND featured_until IS NULL) OR
    (featured = true)
  ),
  
  -- JSON schema validation for complex data validation
  CONSTRAINT listing_schema_valid CHECK (
    jsonb_matches_schema(
      get_listing_schema(),
      to_jsonb(listings.*) - 'id'::text
    )
  )
);

-- Enhanced Bids table with validation
CREATE TABLE IF NOT EXISTS bids (
  id serial PRIMARY KEY,
  listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  is_auto_bid boolean DEFAULT false NOT NULL,
  max_auto_bid numeric(10,2),
  placed_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Data integrity constraints
  CONSTRAINT valid_bid_amount CHECK (amount >= 0 AND amount <= 10000000),
  CONSTRAINT valid_max_auto_bid CHECK (max_auto_bid IS NULL OR (max_auto_bid >= amount AND max_auto_bid <= 10000000)),
  CONSTRAINT valid_auto_bid_consistency CHECK (
    (is_auto_bid = false AND max_auto_bid IS NULL) OR
    (is_auto_bid = true AND max_auto_bid IS NOT NULL)
  ),
  
  -- JSON schema validation
  CONSTRAINT bid_schema_valid CHECK (
    jsonb_matches_schema(
      get_bid_schema(),
      to_jsonb(bids.*) - 'id'::text
    )
  )
);

-- Favorites table with validation
CREATE TABLE IF NOT EXISTS favorites (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id integer NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Prevent duplicate favorites
  UNIQUE(user_id, listing_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_dealer ON profiles(is_dealer) WHERE is_dealer = true;

CREATE INDEX IF NOT EXISTS idx_listings_status_category ON listings(status, category);
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_category_featured ON listings(category, featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_auction_end ON listings(auction_end_time) WHERE is_auction = true;
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || brand || ' ' || model));

CREATE INDEX IF NOT EXISTS idx_bids_listing_amount ON bids(listing_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_user_placed ON bids(user_id, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);

-- Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Listing policies
CREATE POLICY "Active listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Bid policies
CREATE POLICY "Bids are viewable by listing owner and bidders" ON bids
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT user_id FROM listings WHERE id = listing_id)
  );

CREATE POLICY "Authenticated users can place bids" ON bids
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() != (SELECT user_id FROM listings WHERE id = listing_id) AND
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND is_auction = true 
      AND status = 'active' 
      AND auction_end_time > now()
    )
  );

-- Favorite policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Trigger functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate bid amount against listing
CREATE OR REPLACE FUNCTION validate_bid_amount()
RETURNS TRIGGER AS $$
DECLARE
  listing_record listings%ROWTYPE;
  current_highest_bid numeric(10,2);
BEGIN
  -- Get listing details
  SELECT * INTO listing_record FROM listings WHERE id = NEW.listing_id;
  
  -- Check if listing exists and is an active auction
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
  
  IF listing_record.status != 'active' OR NOT listing_record.is_auction THEN
    RAISE EXCEPTION 'Listing is not an active auction';
  END IF;
  
  IF listing_record.auction_end_time <= now() THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;
  
  -- Get current highest bid
  SELECT COALESCE(MAX(amount), listing_record.price) INTO current_highest_bid
  FROM bids WHERE listing_id = NEW.listing_id;
  
  -- Validate bid amount
  IF NEW.amount <= current_highest_bid THEN
    RAISE EXCEPTION 'Bid amount must be higher than current highest bid of %', current_highest_bid;
  END IF;
  
  IF NEW.amount < (current_highest_bid + listing_record.min_bid_increment) THEN
    RAISE EXCEPTION 'Bid amount must be at least % higher than current bid', listing_record.min_bid_increment;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_bid_before_insert
  BEFORE INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION validate_bid_amount();

-- Function to update current_bid in listings
CREATE OR REPLACE FUNCTION update_listing_current_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings 
  SET current_bid = NEW.amount,
      updated_at = now()
  WHERE id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_current_bid_after_insert
  AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION update_listing_current_bid();

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id_param integer)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET views = views + 1,
      updated_at = now()
  WHERE id = listing_id_param AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings 
    SET favorites_count = favorites_count + 1,
        updated_at = now()
    WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings 
    SET favorites_count = favorites_count - 1,
        updated_at = now()
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_count_trigger
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Data validation functions for application use
CREATE OR REPLACE FUNCTION validate_listing_data(listing_data jsonb)
RETURNS boolean AS $$
BEGIN
  RETURN jsonb_matches_schema(get_listing_schema(), listing_data);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_profile_data(profile_data jsonb)
RETURNS boolean AS $$
BEGIN
  RETURN jsonb_matches_schema(get_profile_schema(), profile_data);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_bid_data(bid_data jsonb)
RETURNS boolean AS $$
BEGIN
  RETURN jsonb_matches_schema(get_bid_schema(), bid_data);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
