-- Create function to reset free tier profiles based on trial_end_date
CREATE OR REPLACE FUNCTION reset_free_tier_profiles()
RETURNS TABLE (
  profile_id UUID,
  display_name TEXT,
  email TEXT,
  profile_age_days INTEGER,
  products_deleted INTEGER,
  listings_deleted INTEGER,
  gallery_items_deleted INTEGER,
  reset_timestamp TIMESTAMPTZ
) AS $$
DECLARE
  profile_record RECORD;
  products_count INTEGER;
  listings_count INTEGER;
  gallery_count INTEGER;
BEGIN
  -- Find all free tier users whose trial has expired
  FOR profile_record IN 
    SELECT p.id, p.display_name, p.email, p.created_at, p.trial_end_date
    FROM profiles p
    WHERE p.subscription_tier = 'free'
      AND p.trial_end_date IS NOT NULL
      AND p.trial_end_date <= NOW()
  LOOP
    -- Count items before deletion
    SELECT COUNT(*) INTO products_count FROM profile_products WHERE profile_id = profile_record.id;
    SELECT COUNT(*) INTO listings_count FROM profile_listings WHERE profile_id = profile_record.id;
    SELECT COUNT(*) INTO gallery_count FROM profile_gallery WHERE profile_id = profile_record.id;
    
    -- Delete all user content (but preserve profile)
    DELETE FROM profile_products WHERE profile_id = profile_record.id;
    DELETE FROM profile_listings WHERE profile_id = profile_record.id;
    DELETE FROM profile_gallery WHERE profile_id = profile_record.id;
    DELETE FROM profile_analytics WHERE profile_id = profile_record.id;
    
    -- Reset profile counters and extend trial by 5 minutes
    UPDATE profiles 
    SET 
      current_listings = 0,
      profile_views = 0,
      last_view_reset = NOW(),
      last_free_reset = NOW(),
      trial_end_date = NOW() + INTERVAL '5 minutes'
    WHERE id = profile_record.id;
    
    -- Log the reset
    INSERT INTO reset_history (
      profile_id,
      reset_date,
      products_deleted,
      listings_deleted,
      gallery_items_deleted,
      subscription_tier
    ) VALUES (
      profile_record.id,
      NOW(),
      products_count,
      listings_count,
      gallery_count,
      'free'
    );
    
    -- Return the result
    profile_id := profile_record.id;
    display_name := profile_record.display_name;
    email := profile_record.email;
    profile_age_days := EXTRACT(DAY FROM NOW() - profile_record.created_at)::INTEGER;
    products_deleted := products_count;
    listings_deleted := listings_count;
    gallery_items_deleted := gallery_count;
    reset_timestamp := NOW();
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_free_tier_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_free_tier_profiles() TO service_role;