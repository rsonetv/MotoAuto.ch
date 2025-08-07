CREATE OR REPLACE FUNCTION increment_view_count(auction_id_param bigint)
RETURNS void AS $$
BEGIN
  UPDATE auctions
  SET view_count = view_count + 1
  WHERE id = auction_id_param;
END;
$$ LANGUAGE plpgsql;