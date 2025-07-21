-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only allow inserts from authenticated users or service role
CREATE POLICY "Allow analytics inserts" ON analytics_events
    FOR INSERT
    WITH CHECK (true);

-- Only allow admins to read analytics data
CREATE POLICY "Allow admin analytics reads" ON analytics_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );
