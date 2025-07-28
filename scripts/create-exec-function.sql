-- Create the exec function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION public.exec(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
END;
$$;