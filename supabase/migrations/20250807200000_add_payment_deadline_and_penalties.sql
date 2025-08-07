-- Add payment_deadline to transactions and create user_penalties table

-- Add new status to payments table
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled_no_payment'));

-- Add payment_deadline to payments table
ALTER TABLE public.payments
ADD COLUMN payment_deadline TIMESTAMPTZ;

-- Create user_penalties table
CREATE TABLE IF NOT EXISTS public.user_penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    reason TEXT,
    points_deducted DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_penalties_user_id ON public.user_penalties(user_id);

-- Add reputation_score to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'reputation_score'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN reputation_score DECIMAL(10, 2) DEFAULT 100.00;
    END IF;
END
$$;