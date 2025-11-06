-- PayFast + EFT Payment System Setup
-- Add payment tracking columns to existing profiles table

-- Add payment-related columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payment_method TEXT, -- 'payfast', 'eft', 'free'
ADD COLUMN IF NOT EXISTS payment_reference TEXT, -- Unique payment reference
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT, -- For EFT proof uploads
ADD COLUMN IF NOT EXISTS payfast_customer_id TEXT, -- PayFast customer reference
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Add payment status constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add payment method constraint  
ALTER TABLE profiles 
ADD CONSTRAINT profiles_payment_method_check 
CHECK (payment_method IN ('payfast', 'eft', 'free'));

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('payfast', 'eft')),
    amount_cents INTEGER NOT NULL, -- Amount in cents (e.g., 9900 = R99.00)
    currency TEXT DEFAULT 'ZAR',
    reference TEXT NOT NULL, -- Unique payment reference
    payfast_payment_id TEXT, -- PayFast transaction ID
    payfast_signature TEXT, -- PayFast security signature
    tier_requested TEXT NOT NULL CHECK (tier_requested IN ('premium', 'business')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE,
    proof_of_payment_url TEXT, -- For EFT payments
    admin_notes TEXT, -- Admin verification notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_profile_id ON payment_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Create EFT banking details table
CREATE TABLE IF NOT EXISTS eft_banking_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL DEFAULT 'Standard Bank',
    account_name TEXT NOT NULL DEFAULT 'A2Z Business Directory',
    account_number TEXT NOT NULL DEFAULT '123456789',
    branch_code TEXT NOT NULL DEFAULT '051001',
    account_type TEXT NOT NULL DEFAULT 'Current',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default banking details
INSERT INTO eft_banking_details (bank_name, account_name, account_number, branch_code)
VALUES ('Standard Bank', 'A2Z Business Directory', '123456789', '051001')
ON CONFLICT DO NOTHING;

-- Create pricing table
CREATE TABLE IF NOT EXISTS subscription_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL CHECK (tier IN ('premium', 'business')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    discount_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO subscription_pricing (tier, billing_cycle, amount_cents, discount_percentage) VALUES
('premium', 'monthly', 9900, 0), -- R99.00
('premium', 'annual', 106920, 10), -- R1069.20 (10% discount)
('business', 'monthly', 29900, 0), -- R299.00
('business', 'annual', 323892, 10) -- R3238.92 (10% discount)
ON CONFLICT DO NOTHING;

-- Create function to generate payment reference
CREATE OR REPLACE FUNCTION generate_payment_reference(profile_id UUID, tier TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(SUBSTRING(profile_id::TEXT FROM 1 FOR 8) || '_' || tier);
END;
$$ LANGUAGE plpgsql;

-- Create function to update profile tier after successful payment
CREATE OR REPLACE FUNCTION activate_subscription(p_profile_id UUID, p_tier TEXT, p_billing_cycle TEXT)
RETURNS VOID AS $$
DECLARE
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate subscription end date
    IF p_billing_cycle = 'monthly' THEN
        end_date := NOW() + INTERVAL '1 month';
    ELSE
        end_date := NOW() + INTERVAL '1 year';
    END IF;
    
    -- Update profile
    UPDATE profiles 
    SET 
        subscription_tier = p_tier,
        subscription_status = 'active',
        subscription_start_date = NOW(),
        subscription_end_date = end_date,
        payment_status = 'paid',
        last_payment_date = NOW(),
        updated_at = NOW()
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for admin payment dashboard
CREATE OR REPLACE VIEW admin_payment_overview AS
SELECT 
    pt.id,
    pt.reference,
    p.display_name,
    p.email,
    pt.payment_method,
    pt.tier_requested,
    pt.amount_cents,
    pt.status,
    pt.payment_date,
    pt.proof_of_payment_url,
    pt.admin_notes,
    pt.created_at,
    CASE 
        WHEN pt.payment_method = 'eft' AND pt.status = 'pending' THEN 'Needs Verification'
        WHEN pt.status = 'paid' THEN 'Completed'
        WHEN pt.status = 'pending' THEN 'Awaiting Payment'
        ELSE INITCAP(pt.status)
    END as status_display
FROM payment_transactions pt
JOIN profiles p ON pt.profile_id = p.id
ORDER BY pt.created_at DESC;

-- Add RLS policies for payment transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (profile_id = auth.uid());

-- Users can insert their own transactions
CREATE POLICY "Users can create own transactions" ON payment_transactions
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Admins can see all transactions
CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Add indexes for profiles payment columns
CREATE INDEX IF NOT EXISTS idx_profiles_payment_status ON profiles(payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_payment_method ON profiles(payment_method);
CREATE INDEX IF NOT EXISTS idx_profiles_last_payment_date ON profiles(last_payment_date);

-- Summary of what was created:
SELECT 'Payment system setup complete!' as status;
SELECT 'Tables created: payment_transactions, eft_banking_details, subscription_pricing' as tables;
SELECT 'Functions created: generate_payment_reference, activate_subscription' as functions;
SELECT 'View created: admin_payment_overview' as views;
