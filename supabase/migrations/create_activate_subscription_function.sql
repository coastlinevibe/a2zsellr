-- Create function to activate subscription and update user tier
CREATE OR REPLACE FUNCTION activate_subscription(
  p_profile_id UUID,
  p_tier TEXT,
  p_billing_cycle TEXT DEFAULT 'monthly'
)
RETURNS VOID AS $$
BEGIN
  -- Update the user's subscription tier and status
  UPDATE profiles 
  SET 
    subscription_tier = p_tier,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = p_profile_id;
  
  -- Log the activation
  INSERT INTO payment_transactions (
    profile_id,
    tier_requested,
    amount_cents,
    currency,
    status,
    billing_cycle,
    created_at,
    updated_at
  ) VALUES (
    p_profile_id,
    p_tier,
    CASE 
      WHEN p_tier = 'premium' THEN 14900  -- R149.00
      WHEN p_tier = 'business' THEN 29900 -- R299.00
      ELSE 0
    END,
    'ZAR',
    'paid',
    p_billing_cycle,
    NOW(),
    NOW()
  );
  
  -- If upgrading to premium or business, clear trial end date
  IF p_tier IN ('premium', 'business') THEN
    UPDATE profiles 
    SET trial_end_date = NULL
    WHERE id = p_profile_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION activate_subscription(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_subscription(UUID, TEXT, TEXT) TO service_role;