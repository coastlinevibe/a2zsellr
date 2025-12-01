-- Drop old function
DROP FUNCTION IF EXISTS activate_scheduled_listings();

-- Create new function that activates listings AND sends emails via Resend
CREATE OR REPLACE FUNCTION activate_scheduled_listings()
RETURNS TABLE(activated_count INT, error_message TEXT) AS $$
DECLARE
  v_activated_count INT := 0;
  v_listing RECORD;
  v_profile RECORD;
  v_response http_response;
  v_payload TEXT;
BEGIN
  -- Find all scheduled listings where scheduled_for time has passed
  FOR v_listing IN
    SELECT id, title, profile_id, scheduled_for
    FROM profile_listings
    WHERE status = 'scheduled'
    AND scheduled_for <= NOW()
  LOOP
    -- Update listing status to active
    UPDATE profile_listings
    SET status = 'active', updated_at = NOW()
    WHERE id = v_listing.id;
    
    v_activated_count := v_activated_count + 1;
    
    -- Get profile info for email
    SELECT email, display_name INTO v_profile
    FROM profiles
    WHERE id = v_listing.profile_id;
    
    -- Send email via Resend if profile has email
    IF v_profile.email IS NOT NULL THEN
      BEGIN
        v_payload := json_build_object(
          'from', 'notifications@a2zsellr.life',
          'to', ARRAY[v_profile.email],
          'subject', '🚀 Your Listing "' || v_listing.title || '" is Now Active!',
          'html', '<html><body style="font-family:Arial"><h1>🚀 Listing Activated!</h1><p>Hi ' || COALESCE(v_profile.display_name, 'there') || '!</p><p>Your listing <strong>' || v_listing.title || '</strong> is now active and ready to share!</p><a href="https://www.a2zsellr.life/dashboard/listings">View Your Listing</a></body></html>'
        )::text;

        -- Call Resend API
        SELECT * INTO v_response FROM http_post(
          'https://api.resend.com/emails',
          v_payload,
          'application/json',
          ARRAY[http_header('Authorization', 'Bearer re_MSBmNBSn_8h8bQe8TKqrqph3HphNZBVd2')]
        );

        IF v_response.status = 200 THEN
          RAISE NOTICE 'Email sent to % for listing %', v_profile.email, v_listing.title;
        ELSE
          RAISE WARNING 'Failed to send email to %: %', v_profile.email, v_response.content;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error sending email for listing %: %', v_listing.id, SQLERRM;
      END;
    END IF;
    
  END LOOP;
  
  RETURN QUERY SELECT v_activated_count, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
