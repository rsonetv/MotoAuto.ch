-- supabase/migrations/20250731135803_add_user_id_to_packages.sql

-- Step 1: Add the user_id column to the packages table
ALTER TABLE public.packages
ADD COLUMN user_id UUID;

-- Step 2: Add a foreign key constraint to link user_id to the auth.users table
ALTER TABLE public.packages
ADD CONSTRAINT packages_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE; -- Optional: Deletes packages if the user is deleted

-- Step 3: Add a policy to ensure users can only see their own packages
-- First, enable Row Level Security (RLS) on the table if it's not already enabled
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read packages" ON public.packages;
DROP POLICY IF EXISTS "Allow individual user access to their own packages" ON public.packages;

-- Create a new policy that allows users to perform all actions on their own packages
CREATE POLICY "Allow individual user access to their own packages"
ON public.packages
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Optional: If you want to allow read access for all authenticated users, you can add this policy instead or as well
-- CREATE POLICY "Allow authenticated read access"
-- ON public.packages
-- FOR SELECT
-- TO authenticated
-- USING (true);