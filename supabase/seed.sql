-- Seed data for MotoAuto.ch
-- Author: MotoAuto.ch Team
-- Date: 2025-07-29

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
