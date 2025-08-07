CREATE OR REPLACE FUNCTION public.decrement_reputation(user_id_param uuid, decrement_value numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET reputation_score = reputation_score - decrement_value
  WHERE id = user_id_param;
END;
$$;