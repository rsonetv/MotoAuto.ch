-- Add sort_order column to packages table
ALTER TABLE public.packages
ADD COLUMN sort_order INTEGER;

-- Optional: Set a default sort order for existing packages
-- This will prevent null values and ensure a consistent order.
-- You might want to adjust the logic based on your needs.
UPDATE public.packages
SET sort_order = 
  CASE 
    WHEN id = 'private' THEN 1
    WHEN id = 'dealer-lite' THEN 2
    WHEN id = 'dealer-starter' THEN 3
    WHEN id = 'dealer-pro' THEN 4
    WHEN id = 'dealer-enterprise' THEN 5
    ELSE 99
  END
WHERE sort_order IS NULL;