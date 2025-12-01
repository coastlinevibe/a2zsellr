-- Simple trigger: When listing becomes active, call your API endpoint
CREATE OR REPLACE FUNCTION trigger_send_listing_email()
RETURNS TRIGGER AS $$
DECLARE
  v_profile RECORD;
  v_response http_response;
  v_payload TEXT;
BEGIN
  -- Only send email when status changes to 'active' from 'scheduled'
  IF NEW.status = 'active' AND OLD.status = 'scheduled' THEN
    -- Get profile info
    SELECT email, display_name INTO v_profile
    FROM profiles
    WHERE id = NEW.profile_id;

    IF v_profile.email IS NOT NULL THEN
      v_payload := json_build_object(
        'email', v_profile.email,
        'displayName', COALESCE(v_profile.display_name, 'there'),
        'listingTitle', NEW.title,
        'listingId', NEW.id
      )::text;

      -- Call your Next.js API endpoint
      SELECT * INTO v_response FROM http_post(
        'https://www.a2zsellr.life/api/send-listing-activated-email',
        v_payload,
        'application/json'
      );

      IF v_response.status = 200 THEN
        RAISE NOTICE 'Email request sent for listing %', NEW.id;
      ELSE
        RAISE WARNING 'Failed to send email request for listing %: %', NEW.id, v_response.content;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_listing_email ON profile_listings;

-- Create trigger on profile_listings
CREATE TRIGGER trigger_listing_email
AFTER UPDATE ON profile_listings
FOR EACH ROW
EXECUTE FUNCTION trigger_send_listing_email();
