-- Migration: Create auction_edits table for tracking changes
-- Author: Kilo Code
-- Date: 2025-08-07

CREATE TABLE IF NOT EXISTS public.auction_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edited_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_listing
    FOREIGN KEY(listing_id) 
    REFERENCES listings(id),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES profiles(id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_auction_edits_listing_id ON public.auction_edits(listing_id);

-- RLS for auction_edits
ALTER TABLE public.auction_edits ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view edits for active listings
CREATE POLICY "Public can view edits for active listings" ON public.auction_edits
  FOR SELECT TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = auction_edits.listing_id AND status = 'active'
    )
  );

-- Policy: Listing owners can view all edits for their listings
CREATE POLICY "Owners can view their listing edits" ON public.auction_edits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = auction_edits.listing_id AND user_id = auth.uid()
    )
  );

-- Policy: Only authenticated users (implicitly owners through other logic) can insert edits
-- This will be handled by the API logic, ensuring only owners can trigger this.
CREATE POLICY "Authenticated users can insert edits" ON public.auction_edits
  FOR INSERT TO authenticated
  WITH CHECK (true);