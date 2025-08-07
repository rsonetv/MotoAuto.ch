-- Add decision_deadline to listings and update status check constraint

-- First, drop the existing constraint
ALTER TABLE public.listings
DROP CONSTRAINT listings_status_check;

-- Then, add the new constraint with the new status
ALTER TABLE public.listings
ADD CONSTRAINT listings_status_check CHECK (status IN ('draft', 'active', 'sold', 'expired', 'suspended', 'ENDED_SUCCESS', 'ENDED_UNSOLD', 'ENDED_RESERVE_NOT_MET'));

-- Finally, add the new column
ALTER TABLE public.listings
ADD COLUMN decision_deadline TIMESTAMPTZ;