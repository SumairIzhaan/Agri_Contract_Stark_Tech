-- Remote Procedure Call (RPC) to strictly handle rating updates
-- This avoids RLS issues where a Buyer cannot update a Farmer's profile directly.

CREATE OR REPLACE FUNCTION rate_farmer(
  target_farmer_id UUID,
  rating_value DECIMAL
)
RETURNS JSON
SECURITY DEFINER -- Runs with privileges of the function creator (admin), bypassing RLS
AS $$
DECLARE
  old_rating DECIMAL;
  old_total INTEGER;
  new_rating DECIMAL;
  new_total INTEGER;
BEGIN
  -- 1. Fetch current stats
  SELECT COALESCE(rating, 0), COALESCE(total_ratings, 0)
  INTO old_rating, old_total
  FROM profiles
  WHERE id = target_farmer_id;

  -- 2. Calculate new stats
  new_total := old_total + 1;
  new_rating := ((old_rating * old_total) + rating_value) / new_total;

  -- 3. Update profile
  UPDATE profiles
  SET 
    rating = new_rating,
    total_ratings = new_total
  WHERE id = target_farmer_id;

  RETURN json_build_object('success', true, 'new_rating', new_rating);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
