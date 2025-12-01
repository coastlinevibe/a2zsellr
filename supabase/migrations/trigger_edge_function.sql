-- Create trigger that calls Edge Function when listing status changes
CREATE OR REPLACE FUNCTION trigger_listing_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'active' from 'scheduled'
  IF NEW.status = 'active' AND OLD.status = 'scheduled' THEN
    -- Call the Edge Function via HTTP
    PERFORM http_post(
      'https://' || current_setting('app.supabase_url') || '/functions/v1/send-listing-activated-email',
      json_build_object(
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )::text,
      'application/json',
      ARRAY[
        http_header('Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')),
        http_header('Content-Type', 'application/json')
      ]
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_listing_status_change ON profile_listings;

-- Create trigger
CREATE TRIGGER trigger_listing_status_change
AFTER UPDATE ON profile_listings
FOR EACH ROW
EXECUTE FUNCTION trigger_listing_status_change();
