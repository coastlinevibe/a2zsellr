-- Better approach: Use Supabase Edge Functions instead of direct HTTP from database
-- This is more reliable than database HTTP calls

DROP FUNCTION IF EXISTS activate_scheduled_listings();

-- Create function that just updates status and logs for webhook processing
CREATE OR REPLACE FUNCTION activate_scheduled_listings()
RETURNS TABLE(activated_count INT, error_message TEXT) AS $$
DECLARE
  v_activated_count INT := 0;
  v_listing RECORD;
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
    
    -- Log the activation for webhook processing
    INSERT INTO listing_activation_log (listing_id, profile_id, activated_at, email_sent)
    VALUES (v_listing.id, v_listing.profile_id, NOW(), FALSE);
    
  END LOOP;
  
  RETURN QUERY SELECT v_activated_count, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to send emails via webhook when listings are activated
-- This will call your Next.js API endpoint via a more reliable method
CREATE OR REPLACE FUNCTION send_listing_activated_email()
RETURNS TRIGGER AS $$
DECLARE
  v_profile RECORD;
  v_listing RECORD;
BEGIN
  -- Get listing details
  SELECT id, title, profile_id INTO v_listing
  FROM profile_listings
  WHERE id = NEW.listing_id;
  
  -- Get profile details
  SELECT email, display_name INTO v_profile
  FROM profiles
  WHERE id = NEW.profile_id;
  
  -- Insert into a queue table for processing
  INSERT INTO email_queue (
    listing_id,
    profile_id,
    email,
    display_name,
    listing_title,
    email_type,
    status,
    created_at
  ) VALUES (
    NEW.listing_id,
    NEW.profile_id,
    v_profile.email,
    v_profile.display_name,
    v_listing.title,
    'listing_activated',
    'pending',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create email queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES profile_listings(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  listing_title TEXT,
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_send_listing_activated_email ON listing_activation_log;

-- Create trigger
CREATE TRIGGER trigger_send_listing_activated_email
AFTER INSERT ON listing_activation_log
FOR EACH ROW
EXECUTE FUNCTION send_listing_activated_email();
