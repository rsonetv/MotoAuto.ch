-- MotoAuto.ch Database Internationalization Migration
-- Comprehensive i18n setup for PostgreSQL/Supabase

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 1. Add translation columns to existing categories table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'name_translations') THEN
        ALTER TABLE categories ADD COLUMN name_translations JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'description_translations') THEN
        ALTER TABLE categories ADD COLUMN description_translations JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Add translation columns to listings table  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'listings' AND column_name = 'title_translations') THEN
        ALTER TABLE listings ADD COLUMN title_translations JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'listings' AND column_name = 'description_translations') THEN
        ALTER TABLE listings ADD COLUMN description_translations JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Add translation column to profiles table for bio
DO $$
BEGIN  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio_translations') THEN
        ALTER TABLE profiles ADD COLUMN bio_translations JSONB DEFAULT '{}';
    END IF;

    -- Add preferred language field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferred_language') THEN
        ALTER TABLE profiles ADD COLUMN preferred_language TEXT DEFAULT 'pl';
    END IF;
END $$;

-- 4. Create translation helper functions
CREATE OR REPLACE FUNCTION get_translation(translations JSONB, locale TEXT DEFAULT 'pl')
RETURNS TEXT AS $$
BEGIN
  -- Handle null input
  IF translations IS NULL THEN
    RETURN '';
  END IF;

  -- Try requested locale first
  IF translations ? locale AND translations ->> locale IS NOT NULL AND trim(translations ->> locale) != '' THEN
    RETURN translations ->> locale;
  END IF;

  -- Fallback to Polish
  IF translations ? 'pl' AND translations ->> 'pl' IS NOT NULL AND trim(translations ->> 'pl') != '' THEN
    RETURN translations ->> 'pl';
  END IF;

  -- Fallback to English  
  IF translations ? 'en' AND translations ->> 'en' IS NOT NULL AND trim(translations ->> 'en') != '' THEN
    RETURN translations ->> 'en';
  END IF;

  -- Fallback to German
  IF translations ? 'de' AND translations ->> 'de' IS NOT NULL AND trim(translations ->> 'de') != '' THEN
    RETURN translations ->> 'de';
  END IF;

  -- Return first available translation
  DECLARE
    key TEXT;
  BEGIN
    FOR key IN SELECT jsonb_object_keys(translations) LIMIT 1 LOOP
      IF translations ->> key IS NOT NULL AND trim(translations ->> key) != '' THEN
        RETURN translations ->> key;
      END IF;
    END LOOP;
  END;

  RETURN '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Function to set translation
CREATE OR REPLACE FUNCTION set_translation(translations JSONB, locale TEXT, value TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_set(COALESCE(translations, '{}'), ARRAY[locale], to_jsonb(trim(value)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Function to check translation completeness
CREATE OR REPLACE FUNCTION translation_completeness(translations JSONB)
RETURNS INTEGER AS $$
DECLARE
  total_locales INTEGER := 5; -- pl, de, fr, en, it
  completed_count INTEGER := 0;
  locale TEXT;
BEGIN
  IF translations IS NULL THEN
    RETURN 0;
  END IF;

  FOR locale IN SELECT unnest(ARRAY['pl', 'de', 'fr', 'en', 'it']) LOOP
    IF translations ? locale AND translations ->> locale IS NOT NULL AND trim(translations ->> locale) != '' THEN
      completed_count := completed_count + 1;
    END IF;
  END LOOP;

  RETURN (completed_count * 100) / total_locales;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Create translation logs table for tracking changes
CREATE TABLE IF NOT EXISTS translation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_languages TEXT[] NOT NULL,
  translations JSONB NOT NULL,
  translation_method TEXT DEFAULT 'manual',
  quality_score DECIMAL(3,2),
  reviewed BOOLEAN DEFAULT false,
  reviewer_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Migrate existing data to translation fields
-- Categories
UPDATE categories 
SET name_translations = jsonb_build_object('pl', name)
WHERE name_translations = '{}' AND name IS NOT NULL;

-- If you have existing localized category names, update them here:
-- Example for German car categories
UPDATE categories 
SET name_translations = name_translations || jsonb_build_object('de', 
  CASE 
    WHEN name = 'Samochody' THEN 'Autos'
    WHEN name = 'Motocykle' THEN 'Motorräder' 
    WHEN name = 'Ciężarówki' THEN 'LKWs'
    WHEN name = 'Części' THEN 'Teile'
    ELSE name
  END
)
WHERE name IS NOT NULL;

-- Listings - migrate existing title to Polish translation
UPDATE listings 
SET title_translations = jsonb_build_object('pl', title)
WHERE title_translations = '{}' AND title IS NOT NULL;

-- Listings - migrate existing description to Polish translation  
UPDATE listings 
SET description_translations = jsonb_build_object('pl', description)
WHERE description_translations = '{}' AND description IS NOT NULL;

-- 9. Create trigger function for automatic translation logging
CREATE OR REPLACE FUNCTION log_translation_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when translation fields actually change
  IF TG_OP = 'UPDATE' THEN
    IF OLD.title_translations IS DISTINCT FROM NEW.title_translations THEN
      INSERT INTO translation_logs (table_name, record_id, field_name, source_language, target_languages, translations, translation_method)
      VALUES (TG_TABLE_NAME, NEW.id, 'title', 'pl', ARRAY['de', 'fr', 'en', 'it'], NEW.title_translations, 'manual');
    END IF;

    IF OLD.description_translations IS DISTINCT FROM NEW.description_translations THEN
      INSERT INTO translation_logs (table_name, record_id, field_name, source_language, target_languages, translations, translation_method)
      VALUES (TG_TABLE_NAME, NEW.id, 'description', 'pl', ARRAY['de', 'fr', 'en', 'it'], NEW.description_translations, 'manual');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for translation logging
DROP TRIGGER IF EXISTS listings_translation_log ON listings;
CREATE TRIGGER listings_translation_log
  AFTER UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION log_translation_changes();

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name_translations_gin ON categories USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_categories_description_translations_gin ON categories USING GIN (description_translations);
CREATE INDEX IF NOT EXISTS idx_listings_title_translations_gin ON listings USING GIN (title_translations);
CREATE INDEX IF NOT EXISTS idx_listings_description_translations_gin ON listings USING GIN (description_translations);
CREATE INDEX IF NOT EXISTS idx_profiles_bio_translations_gin ON profiles USING GIN (bio_translations);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON profiles (preferred_language);
CREATE INDEX IF NOT EXISTS idx_translation_logs_table_record ON translation_logs (table_name, record_id);

-- 12. Create multilingual views for easy access
CREATE OR REPLACE VIEW listings_multilingual AS
SELECT 
  l.*,
  get_translation(l.title_translations, 'pl') as title_pl,
  get_translation(l.title_translations, 'de') as title_de,
  get_translation(l.title_translations, 'fr') as title_fr,
  get_translation(l.title_translations, 'en') as title_en,
  get_translation(l.title_translations, 'it') as title_it,
  get_translation(l.description_translations, 'pl') as description_pl,
  get_translation(l.description_translations, 'de') as description_de,
  get_translation(l.description_translations, 'fr') as description_fr,
  get_translation(l.description_translations, 'en') as description_en,
  get_translation(l.description_translations, 'it') as description_it,
  translation_completeness(l.title_translations) as title_completeness,
  translation_completeness(l.description_translations) as description_completeness
FROM listings l;

-- 13. Create RLS policies for translation logs
ALTER TABLE translation_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to see translation logs for their own content
CREATE POLICY "Users can see translation logs for their listings" ON translation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id::text = translation_logs.record_id 
      AND listings.user_id = auth.uid()
    )
  );

-- Allow authenticated users to insert translation logs
CREATE POLICY "Authenticated users can create translation logs" ON translation_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 14. Grant necessary permissions
GRANT SELECT ON listings_multilingual TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_translation(JSONB, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_translation(JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION translation_completeness(JSONB) TO anon, authenticated;

-- 15. Insert sample multilingual categories if none exist
INSERT INTO categories (id, name_translations, description_translations, slug, sort_order, active) 
VALUES 
  (
    uuid_generate_v4(),
    '{"pl": "Samochody", "de": "Autos", "fr": "Voitures", "en": "Cars", "it": "Auto"}',
    '{"pl": "Samochody osobowe i dostawcze", "de": "Personenwagen und Transporter", "fr": "Voitures particulières et utilitaires", "en": "Passenger and commercial vehicles", "it": "Auto personali e commerciali"}',
    'cars',
    1,
    true
  ),
  (
    uuid_generate_v4(), 
    '{"pl": "Motocykle", "de": "Motorräder", "fr": "Motos", "en": "Motorcycles", "it": "Moto"}',
    '{"pl": "Motocykle, skutery i quady", "de": "Motorräder, Roller und Quads", "fr": "Motos, scooters et quads", "en": "Motorcycles, scooters and quads", "it": "Moto, scooter e quad"}',
    'motorcycles',
    2,
    true
  ),
  (
    uuid_generate_v4(),
    '{"pl": "Części", "de": "Teile", "fr": "Pièces", "en": "Parts", "it": "Parti"}', 
    '{"pl": "Części zamienne i akcesoria", "de": "Ersatzteile und Zubehör", "fr": "Pièces de rechange et accessoires", "en": "Spare parts and accessories", "it": "Ricambi e accessori"}',
    'parts',
    3,
    true
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Verification queries
SELECT 'Database i18n migration completed successfully' as status;
SELECT COUNT(*) as categories_with_translations FROM categories WHERE name_translations != '{}';
SELECT COUNT(*) as listings_with_translations FROM listings WHERE title_translations != '{}';

-- Show translation completeness stats
SELECT 
  'Categories' as table_name,
  AVG(translation_completeness(name_translations)) as avg_name_completeness,
  AVG(translation_completeness(description_translations)) as avg_description_completeness
FROM categories
UNION ALL
SELECT 
  'Listings' as table_name,
  AVG(translation_completeness(title_translations)) as avg_title_completeness,
  AVG(translation_completeness(description_translations)) as avg_description_completeness  
FROM listings;