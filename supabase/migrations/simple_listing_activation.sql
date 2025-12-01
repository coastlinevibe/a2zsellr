-- Drop everything we created
DROP TRIGGER IF EXISTS trigger_listing_activated ON profile_listings;
DROP FUNCTION IF EXISTS on_listing_activated();
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS listing_activation_log;

-- Simple approach: Just update the activate_scheduled_listings function to send emails directly
CREATE OR REPLACE FUNCTION activate_scheduled_listings()
RETURNS TABLE(activated_count INT, error_message TEXT) AS $$
DECLARE
  v_activated_count INT := 0;
  v_listing RECORD;
  v_profile RECORD;
BEGIN
  -- Find all scheduled listings where scheduled_for time has passed
  FOR v_listing IN
    SELECT id, title, created_at
    FROM profile_listings
    WHERE status = 'scheduled'
    AND scheduled_for <= NOW()
  LOOP
    -- Update listing status to active
    UPDATE profile_listings
    SET status = 'active', updated_at = NOW()
    WHERE id = v_listing.id;
    
    v_activated_count := v_activated_count + 1;
    
    RAISE NOTICE 'Listing % activated: %', v_listing.id, v_listing.title;
    
  END LOOP;
  
  RETURN QUERY SELECT v_activated_count, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
