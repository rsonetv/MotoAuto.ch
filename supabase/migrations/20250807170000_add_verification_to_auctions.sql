ALTER TABLE public.auctions
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_report_url TEXT,
ADD COLUMN verified_by TEXT,
ADD COLUMN verification_requested BOOLEAN DEFAULT FALSE;