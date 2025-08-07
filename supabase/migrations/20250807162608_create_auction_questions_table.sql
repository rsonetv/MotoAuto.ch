CREATE TABLE auction_questions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    auction_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    answered_at TIMESTAMPTZ,
    CONSTRAINT fk_auction FOREIGN KEY(auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS Policies
ALTER TABLE auction_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read public questions and answers
CREATE POLICY "Allow public read access" ON auction_questions
FOR SELECT USING (is_public = TRUE);

-- Policy: Allow authenticated users to insert questions for auctions they don't own
CREATE POLICY "Allow authenticated users to insert questions" ON auction_questions
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM auctions
        WHERE id = auction_id AND user_id != auth.uid()
    )
);

-- Policy: Allow auction owner to update with an answer
CREATE POLICY "Allow auction owner to answer" ON auction_questions
FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM auctions
        WHERE id = auction_id AND user_id = auth.uid()
    )
) WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM auctions
        WHERE id = auction_id AND user_id = auth.uid()
    )
);

-- Policy: Allow users to read their own questions even if not public
CREATE POLICY "Allow users to read their own questions" ON auction_questions
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow auction owners to read all questions for their auctions
CREATE POLICY "Allow auction owner to read all questions" ON auction_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auctions
        WHERE id = auction_id AND user_id = auth.uid()
    )
);