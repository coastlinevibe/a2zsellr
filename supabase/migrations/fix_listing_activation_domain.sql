-- Fix the domain in the activate_scheduled_listings function
DROP FUNCTION IF EXISTS activate_scheduled_listings();

-- Recreate with environment-aware domain
CREATE OR REPLACE FUNCTION activate_scheduled_listings()
RETURNS TABLE(activated_count INT, error_message TEXT) AS $$
DECLARE
  v_activated_count INT := 0;
  v_listing RECORD;
  v_profile RECORD;
  v_response RECORD;
  v_payload TEXT;
  v_api_url TEXT;
BEGIN
  -- Determine the API URL based on environment
  -- In production: https://www.a2zsellr.life
  -- In development: http://localhost:3000
  -- You can change this based on your needs
  v_api_url := 'https://www.a2zsellr.life/api/send-listing-activated-email';
  
  -- Find all scheduled listings where scheduled_for time has passed
  FOR v_listing IN
    SELECT id, profile_id, title, scheduled_for
    FROM profile_listings
    WHERE status = 'scheduled'
    AND scheduled_for <= NOW()
  LOOP
    -- Update listing status to active
    UPDATE profile_listings
    SET status = 'active', updated_at = NOW()
    WHERE id = v_listing.id;
    
    v_activated_count := v_activated_count + 1;
    
    -- Get user profile for email
    SELECT email, display_name INTO v_profile
    FROM profiles
    WHERE id = v_listing.profile_id;
    
    -- Log the activation
    INSERT INTO listing_activation_log (listing_id, profile_id, activated_at, email, title)
    VALUES (v_listing.id, v_listing.profile_id, NOW(), v_profile.email, v_listing.title);
    
    -- Send email notification via HTTP request
    BEGIN
      v_payload := json_build_object(
        'email', v_profile.email,
        'displayName', v_profile.display_name,
        'listingTitle', v_listing.title,
        'listingId', v_listing.id
      )::text;
      
      -- Call the email API endpoint
      SELECT * INTO v_response FROM http_post(
        v_api_url,
        v_payload,
        'application/json'
      );
      
      -- Mark email as sent in log
      UPDATE listing_activation_log
      SET email_sent = TRUE
      WHERE listing_id = v_listing.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the activation
      RAISE WARNING 'Failed to send email for listing %: %', v_listing.id, SQLERRM;
    END;
    
  END LOOP;
  
  RETURN QUERY SELECT v_activated_count, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
