-- Add negotiating status to listings

-- First, drop the existing constraint
ALTER TABLE public.listings
DROP CONSTRAINT listings_status_check;

-- Then, add the new constraint with the new status
ALTER TABLE public.listings
ADD CONSTRAINT listings_status_check CHECK (status IN ('draft', 'active', 'sold', 'expired', 'suspended', 'ENDED_SUCCESS', 'ENDED_UNSOLD', 'ENDED_RESERVE_NOT_MET', 'ENDED_NEGOTIATING'));