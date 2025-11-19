-- Drop and recreate the activate_subscription function with better error handling
DROP FUNCTION IF EXISTS activate_subscription(UUID, TEXT, TEXT);

-- Create improved function to activate subscription and update user tier
CREATE OR REPLACE FUNCTION activate_subscription(
  p_profile_id UUID,
  p_tier TEXT,
  p_billing_cycle TEXT DEFAULT 'monthly'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  profile_exists BOOLEAN;
  current_tier TEXT;
BEGIN
  -- Check if profile exists and get current tier
  SELECT subscription_tier INTO current_tier 
  FROM profiles 
  WHERE id = p_profile_id;
  
  IF current_tier IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Profile not found',
      'profile_id', p_profile_id
    );
  END IF;
  
  -- Log the activation attempt
  RAISE NOTICE 'Activating subscription for profile % from % to %', p_profile_id, current_tier, p_tier;
  
  -- Update the user's subscription tier and status
  UPDATE profiles 
  SET 
    subscription_tier = p_tier,
    subscription_status = 'active',
    trial_end_date = NULL,  -- Clear trial restrictions
    updated_at = NOW()
  WHERE id = p_profile_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update profile - no rows affected',
      'profile_id', p_profile_id
    );
  END IF;
  
  -- Log success
  RAISE NOTICE 'Successfully updated profile % to % tier', p_profile_id, p_tier;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'previous_tier', current_tier,
    'new_tier', p_tier,
    'status', 'active',
    'updated_at', NOW()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in activate_subscription: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'profile_id', p_profile_id,
      'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION activate_subscription(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_subscription(UUID, TEXT, TEXT) TO service_role;

-- Test the function (optional - remove in production)
-- SELECT activate_subscription('test-uuid'::UUID, 'premium', 'monthly');