-- PROFILES TABLE CLEANUP
-- Remove all unused columns that are cluttering the table

-- First, drop any dependent views
DROP VIEW IF EXISTS profiles_due_for_reset CASCADE;

-- Drop unused subscription columns
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_start_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_end_date;

-- Drop unused location/category columns (we use business_location and business_category instead)
ALTER TABLE profiles DROP COLUMN IF EXISTS location_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS category_id;

-- Drop unused reset columns (now safe after dropping the view)
ALTER TABLE profiles DROP COLUMN IF EXISTS last_reset_at;

-- Drop unused payment columns (payments are handled in separate tables)
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_method;
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_reference;
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE profiles DROP COLUMN IF EXISTS proof_of_payment_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS payfast_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_payment_date;

-- Drop unused address column (we use business_location instead)
ALTER TABLE profiles DROP COLUMN IF EXISTS address;

-- Recreate the view if needed (using last_free_reset instead of last_reset_at)
CREATE OR REPLACE VIEW profiles_due_for_reset AS
SELECT 
  id,
  display_name,
  email,
  subscription_tier,
  last_free_reset,
  created_at
FROM profiles 
WHERE subscription_tier = 'free'
  AND (
    last_free_reset IS NULL 
    OR last_free_reset < NOW() - INTERVAL '24 hours'
  );

-- Show remaining columns after cleanup
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;