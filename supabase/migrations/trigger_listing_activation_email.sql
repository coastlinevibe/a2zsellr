-- Simple trigger: When listing status changes to 'active', add to email queue
CREATE OR REPLACE FUNCTION on_listing_activated()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'active' from 'scheduled'
  IF NEW.status = 'active' AND OLD.status = 'scheduled' THEN
    -- Insert into email queue (just store the listing ID, we'll join with profiles later)
    INSERT INTO email_queue (
      listing_id,
      email_type,
      status,
      created_at
    ) 
    VALUES (
      NEW.id,
      'listing_activated',
      'pending',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_listing_activated ON profile_listings;

-- Create trigger on profile_listings table
CREATE TRIGGER trigger_listing_activated
AFTER UPDATE ON profile_listings
FOR EACH ROW
EXECUTE FUNCTION on_listing_activated();
