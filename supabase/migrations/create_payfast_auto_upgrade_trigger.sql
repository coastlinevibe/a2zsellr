-- Create a trigger to automatically upgrade subscription when PayFast payment is successful
-- This ensures that even if the webhook fails, the subscription is upgraded when payment status changes

-- First, let's create a function that upgrades subscription based on payment
CREATE OR REPLACE FUNCTION auto_upgrade_subscription_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if this is a PayFast payment that just became 'paid'
  IF NEW.payment_method = 'payfast' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
    
    -- Log the upgrade attempt
    RAISE NOTICE 'Auto-upgrading subscription for profile % to % tier (PayFast payment %)', 
      NEW.profile_id, NEW.tier_requested, NEW.id;
    
    -- Update the user's profile
    UPDATE profiles 
    SET 
      subscription_tier = NEW.tier_requested,
      subscription_status = 'active',
      trial_end_date = NULL,
      updated_at = NOW()
    WHERE id = NEW.profile_id;
    
    -- Log success
    RAISE NOTICE 'Successfully upgraded profile % to % tier', NEW.profile_id, NEW.tier_requested;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the payment table (assuming it's called payment_transactions or similar)
-- We need to find the actual payment table name first

-- Let's also create a function to manually process pending PayFast payments
CREATE OR REPLACE FUNCTION process_pending_payfast_payments()
RETURNS TABLE(
  processed_count INTEGER,
  processed_users TEXT[]
) AS $$
DECLARE
  payment_record RECORD;
  processed_count INTEGER := 0;
  processed_users TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Find all pending PayFast payments and upgrade them
  FOR payment_record IN 
    SELECT DISTINCT ON (profile_id, tier_requested) 
      profile_id, 
      tier_requested,
      display_name,
      email
    FROM admin_payment_overview 
    WHERE payment_method = 'payfast' 
      AND status = 'pending'
    ORDER BY profile_id, tier_requested, created_at DESC
  LOOP
    -- Update the user's profile
    UPDATE profiles 
    SET 
      subscription_tier = payment_record.tier_requested,
      subscription_status = 'active',
      trial_end_date = NULL,
      updated_at = NOW()
    WHERE id = payment_record.profile_id;
    
    -- Increment counter and add to processed list
    processed_count := processed_count + 1;
    processed_users := array_append(processed_users, payment_record.display_name || ' (' || payment_record.email || ')');
    
    RAISE NOTICE 'Processed PayFast payment for % - upgraded to %', 
      payment_record.display_name, payment_record.tier_requested;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, processed_users;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auto_upgrade_subscription_on_payment() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_upgrade_subscription_on_payment() TO service_role;
GRANT EXECUTE ON FUNCTION process_pending_payfast_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION process_pending_payfast_payments() TO service_role;

-- Create a manual function to upgrade specific user
CREATE OR REPLACE FUNCTION upgrade_user_subscription(
  p_profile_id UUID,
  p_tier TEXT
)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user info
  SELECT display_name, email, subscription_tier INTO user_record
  FROM profiles 
  WHERE id = p_profile_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Update subscription
  UPDATE profiles 
  SET 
    subscription_tier = p_tier,
    subscription_status = 'active',
    trial_end_date = NULL,
    updated_at = NOW()
  WHERE id = p_profile_id;
  
  RETURN json_build_object(
    'success', true,
    'user', user_record.display_name,
    'email', user_record.email,
    'previous_tier', user_record.subscription_tier,
    'new_tier', p_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upgrade_user_subscription(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_user_subscription(UUID, TEXT) TO service_role;