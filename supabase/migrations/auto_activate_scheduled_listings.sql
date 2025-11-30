-- Create function to activate scheduled listings and send emails
CREATE OR REPLACE FUNCTION activate_scheduled_listings()
RETURNS TABLE(activated_count INT, error_message TEXT) AS $$
DECLARE
  v_activated_count INT := 0;
  v_listing RECORD;
  v_profile RECORD;
  v_response RECORD;
  v_payload TEXT;
BEGIN
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
      
      -- Call the email API endpoint (use your actual domain, not localhost)
      SELECT * INTO v_response FROM http_post(
        'https://www.a2zsellr.life/api/send-listing-activated-email',
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

-- Create table to log activations (for tracking and debugging)
CREATE TABLE IF NOT EXISTS listing_activation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES profile_listings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT,
  title TEXT,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_listing_activation_log_profile_id ON listing_activation_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_listing_activation_log_activated_at ON listing_activation_log(activated_at);

-- Create a trigger that runs every minute to check and activate scheduled listings
-- Note: This requires pg_cron extension to be enabled on your Supabase project
-- You can enable it in Supabase dashboard under Extensions

-- Grant execute permission to authenticated users (optional, for manual triggers)
GRANT EXECUTE ON FUNCTION activate_scheduled_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION activate_scheduled_listings() TO anon;
