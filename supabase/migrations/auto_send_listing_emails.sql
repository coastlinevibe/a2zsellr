-- Enable http extension for making HTTP requests from database
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to send listing activated email via Resend
CREATE OR REPLACE FUNCTION send_listing_activated_email_resend(
  p_email TEXT,
  p_display_name TEXT,
  p_listing_title TEXT
)
RETURNS void AS $$
DECLARE
  v_response http_response;
  v_payload TEXT;
BEGIN
  v_payload := json_build_object(
    'from', 'notifications@a2zsellr.life',
    'to', ARRAY[p_email],
    'subject', '🚀 Your Listing "' || p_listing_title || '" is Now Active!',
    'html', '<html><body><h1>🚀 Listing Activated!</h1><p>Hi ' || p_display_name || '!</p><p>Your listing <strong>' || p_listing_title || '</strong> is now active and ready to share!</p><a href="https://www.a2zsellr.life/dashboard/listings">View Your Listing</a></body></html>'
  )::text;

  -- Call Resend API
  SELECT * INTO v_response FROM http_post(
    'https://api.resend.com/emails',
    v_payload,
    'application/json',
    ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.resend_api_key'))]
  );

  IF v_response.status != 200 THEN
    RAISE WARNING 'Failed to send email to %: %', p_email, v_response.content;
  ELSE
    RAISE NOTICE 'Email sent successfully to %', p_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function that fires when listing status changes to active
CREATE OR REPLACE FUNCTION trigger_send_listing_email()
RETURNS TRIGGER AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- Only send email when status changes to 'active' from 'scheduled'
  IF NEW.status = 'active' AND OLD.status = 'scheduled' THEN
    -- Get profile info
    SELECT email, display_name INTO v_profile
    FROM profiles
    WHERE id = NEW.profile_id;

    IF v_profile.email IS NOT NULL THEN
      -- Send email via Resend
      PERFORM send_listing_activated_email_resend(
        v_profile.email,
        COALESCE(v_profile.display_name, 'there'),
        NEW.title
      );
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

-- Set the Resend API key as a database setting (run this separately with your actual key)
-- ALTER DATABASE your_db SET app.resend_api_key = 'your_resend_api_key_here';
