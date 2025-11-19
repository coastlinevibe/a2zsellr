-- Function to update current_listings count in profiles table
CREATE OR REPLACE FUNCTION update_current_listings_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_listings count for the affected profile
  IF TG_OP = 'INSERT' THEN
    -- Increment count when a listing is added
    UPDATE profiles 
    SET current_listings = (
      SELECT COUNT(*) 
      FROM profile_listings 
      WHERE profile_id = NEW.profile_id
    ),
    updated_at = NOW()
    WHERE id = NEW.profile_id;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count when a listing is deleted
    UPDATE profiles 
    SET current_listings = (
      SELECT COUNT(*) 
      FROM profile_listings 
      WHERE profile_id = OLD.profile_id
    ),
    updated_at = NOW()
    WHERE id = OLD.profile_id;
    
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle profile_id changes (rare but possible)
    IF OLD.profile_id != NEW.profile_id THEN
      -- Update count for old profile
      UPDATE profiles 
      SET current_listings = (
        SELECT COUNT(*) 
        FROM profile_listings 
        WHERE profile_id = OLD.profile_id
      ),
      updated_at = NOW()
      WHERE id = OLD.profile_id;
      
      -- Update count for new profile
      UPDATE profiles 
      SET current_listings = (
        SELECT COUNT(*) 
        FROM profile_listings 
        WHERE profile_id = NEW.profile_id
      ),
      updated_at = NOW()
      WHERE id = NEW.profile_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_current_listings ON profile_listings;

-- Create trigger on profile_listings table
CREATE TRIGGER trigger_update_current_listings
  AFTER INSERT OR UPDATE OR DELETE ON profile_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_current_listings_count();

-- Update all existing profiles to have correct current_listings count
UPDATE profiles 
SET current_listings = (
  SELECT COUNT(*) 
  FROM profile_listings 
  WHERE profile_listings.profile_id = profiles.id
),
updated_at = NOW();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_listings_profile_id ON profile_listings(profile_id);