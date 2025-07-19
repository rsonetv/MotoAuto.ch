import { NextResponse } from "next/server"
import { supabaseAdmin, verifyAdminConnection } from "@/lib/supabase-admin"

export async function POST() {
  try {
    // Verify admin connection first
    const isConnected = await verifyAdminConnection()
    if (!isConnected) {
      return NextResponse.json({ success: false, error: "Failed to connect with admin privileges" }, { status: 500 })
    }

    // Database setup SQL
    const setupSQL = `
      -- Enable necessary extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";

      -- Create profiles table (extends Supabase auth.users)
      CREATE TABLE IF NOT EXISTS profiles (
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
      CREATE TABLE IF NOT EXISTS listings (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        current_bid DECIMAL(10,2) CHECK (current_bid >= 0),
        category TEXT NOT NULL CHECK (category IN ('auto', 'moto')),
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
        mileage INTEGER CHECK (mileage >= 0),
        engine_capacity INTEGER CHECK (engine_capacity > 0),
        power INTEGER CHECK (power > 0),
        fuel_type TEXT,
        transmission TEXT,
        drive_type TEXT,
        body_type TEXT,
        doors INTEGER CHECK (doors > 0 AND doors <= 10),
        seats INTEGER CHECK (seats > 0 AND seats <= 20),
        color TEXT,
        vin TEXT,
        condition TEXT,
        accident_free BOOLEAN DEFAULT TRUE,
        owners_count INTEGER DEFAULT 1 CHECK (owners_count > 0),
        has_service_book BOOLEAN DEFAULT FALSE,
        last_service_date DATE,
        next_service_due INTEGER CHECK (next_service_due >= 0),
        location TEXT NOT NULL,
        postal_code TEXT,
        latitude DECIMAL(10, 8) CHECK (latitude >= -90 AND latitude <= 90),
        longitude DECIMAL(11, 8) CHECK (longitude >= -180 AND longitude <= 180),
        images TEXT[] DEFAULT '{}',
        documents TEXT[] DEFAULT '{}',
        video_url TEXT,
        is_auction BOOLEAN DEFAULT FALSE,
        auction_start_time TIMESTAMP WITH TIME ZONE,
        auction_end_time TIMESTAMP WITH TIME ZONE,
        reserve_price DECIMAL(10,2) CHECK (reserve_price >= 0),
        buy_now_price DECIMAL(10,2) CHECK (buy_now_price >= 0),
        min_bid_increment DECIMAL(10,2) DEFAULT 100 CHECK (min_bid_increment > 0),
        auto_extend BOOLEAN DEFAULT TRUE,
        warranty_months INTEGER CHECK (warranty_months >= 0),
        financing_available BOOLEAN DEFAULT FALSE,
        trade_in_accepted BOOLEAN DEFAULT FALSE,
        delivery_available BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'draft')),
        views INTEGER DEFAULT 0 CHECK (views >= 0),
        favorites_count INTEGER DEFAULT 0 CHECK (favorites_count >= 0),
        featured BOOLEAN DEFAULT FALSE,
        featured_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE,
        sold_at TIMESTAMP WITH TIME ZONE
      );

      -- Create bids table
      CREATE TABLE IF NOT EXISTS bids (
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
      CREATE TABLE IF NOT EXISTS favorites (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, listing_id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
      CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
      CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
      CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
      CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
      CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
      CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

      -- Enable Row Level Security
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
      ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies for profiles
      DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
      CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
      
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

      -- Create RLS policies for listings
      DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
      CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (
        status = 'active' OR auth.uid() = user_id
      );
      
      DROP POLICY IF EXISTS "Users can create listings" ON listings;
      CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can update own listings" ON listings;
      CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
      CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

      -- Create RLS policies for bids
      DROP POLICY IF EXISTS "Users can view bids for listings they can see" ON bids;
      CREATE POLICY "Users can view bids for listings they can see" ON bids FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM listings 
          WHERE listings.id = bids.listing_id 
          AND (listings.status = 'active' OR listings.user_id = auth.uid())
        )
      );
      
      DROP POLICY IF EXISTS "Users can create bids" ON bids;
      CREATE POLICY "Users can create bids" ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Create RLS policies for favorites
      DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
      CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

      -- Create utility functions
      CREATE OR REPLACE FUNCTION increment_views(listing_id BIGINT)
      RETURNS VOID AS $$
      BEGIN
        UPDATE listings 
        SET views = views + 1 
        WHERE id = listing_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger function for updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
      CREATE TRIGGER update_listings_updated_at 
        BEFORE UPDATE ON listings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    `

    // Execute the setup SQL using the admin client
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql: setupSQL })

    if (error) {
      console.error("Database setup error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Setup database error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
