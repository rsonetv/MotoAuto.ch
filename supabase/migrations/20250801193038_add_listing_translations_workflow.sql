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