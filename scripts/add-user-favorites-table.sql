-- Add user_favorites table for listing favorites functionality
-- This table tracks which users have favorited which listings

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only favorite a listing once
    UNIQUE(user_id, listing_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_listing_id ON user_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only add their own favorites
CREATE POLICY "Users can add their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Listing owners can see who favorited their listings
CREATE POLICY "Listing owners can see favorites on their listings" ON user_favorites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = user_favorites.listing_id 
            AND listings.user_id = auth.uid()
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: user_favorites doesn't have updated_at column, so this trigger is not needed
-- But keeping the function for potential future use

-- Add comments for documentation
COMMENT ON TABLE user_favorites IS 'Tracks which users have favorited which listings';
COMMENT ON COLUMN user_favorites.id IS 'Unique identifier for the favorite record';
COMMENT ON COLUMN user_favorites.user_id IS 'Reference to the user who favorited the listing';
COMMENT ON COLUMN user_favorites.listing_id IS 'Reference to the favorited listing';
COMMENT ON COLUMN user_favorites.created_at IS 'When the listing was favorited';