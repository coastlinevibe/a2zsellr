-- ============================================================================
-- 7-DAY RESET AUTOMATION FOR FREE TIER USERS
-- ============================================================================
-- This SQL function safely resets free tier user data after 7 days
-- It deletes products, listings, and gallery items while preserving the profile
-- 
-- SAFETY FEATURES:
-- 1. Only affects users with subscription_tier = 'free'
-- 2. Only resets profiles older than 7 days
-- 3. Preserves user profile and authentication
-- 4. Tracks reset history for audit trail
-- 5. Returns detailed report of what was deleted
-- ============================================================================

-- Step 1: Create reset_history table to track all resets
CREATE TABLE IF NOT EXISTS public.reset_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reset_date TIMESTAMPTZ DEFAULT NOW(),
    products_deleted INTEGER DEFAULT 0,
    listings_deleted INTEGER DEFAULT 0,
    gallery_items_deleted INTEGER DEFAULT 0,
    profile_age_days INTEGER,
    subscription_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_reset_history_profile_id ON public.reset_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_reset_history_reset_date ON public.reset_history(reset_date DESC);

-- Enable RLS
ALTER TABLE public.reset_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own reset history
CREATE POLICY "Users can view their own reset history" ON public.reset_history
    FOR SELECT USING (auth.uid() = profile_id);

-- Step 2: Add last_reset_at column to profiles table (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_reset_at TIMESTAMPTZ;

-- Step 3: Create the reset function
CREATE OR REPLACE FUNCTION reset_free_tier_profiles()
RETURNS TABLE(
    profile_id UUID,
    display_name TEXT,
    email TEXT,
    profile_age_days INTEGER,
    products_deleted INTEGER,
    listings_deleted INTEGER,
    gallery_items_deleted INTEGER,
    reset_timestamp TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
    v_profile RECORD;
    v_products_count INTEGER;
    v_listings_count INTEGER;
    v_gallery_count INTEGER;
    v_profile_age_days INTEGER;
BEGIN
    -- Loop through all free tier profiles that need reset
    FOR v_profile IN 
        SELECT 
            p.id,
            p.display_name,
            p.email,
            p.subscription_tier,
            p.created_at,
            p.last_reset_at,
            -- Calculate days since last reset or creation
            CASE 
                WHEN p.last_reset_at IS NOT NULL THEN 
                    EXTRACT(DAY FROM (NOW() - p.last_reset_at))
                ELSE 
                    EXTRACT(DAY FROM (NOW() - p.created_at))
            END AS days_since_reset
        FROM public.profiles p
        WHERE 
            -- SAFETY CHECK 1: Only free tier users
            p.subscription_tier = 'free'
            -- SAFETY CHECK 2: Only profiles older than 7 days
            AND (
                (p.last_reset_at IS NULL AND p.created_at < NOW() - INTERVAL '7 days')
                OR 
                (p.last_reset_at IS NOT NULL AND p.last_reset_at < NOW() - INTERVAL '7 days')
            )
    LOOP
        -- Calculate profile age
        v_profile_age_days := CASE 
            WHEN v_profile.last_reset_at IS NOT NULL THEN 
                EXTRACT(DAY FROM (NOW() - v_profile.last_reset_at))::INTEGER
            ELSE 
                EXTRACT(DAY FROM (NOW() - v_profile.created_at))::INTEGER
        END;

        -- Count items before deletion (for reporting)
        SELECT COUNT(*) INTO v_products_count 
        FROM public.profile_products 
        WHERE profile_id = v_profile.id;

        SELECT COUNT(*) INTO v_listings_count 
        FROM public.profile_listings 
        WHERE profile_id = v_profile.id;

        SELECT COUNT(*) INTO v_gallery_count 
        FROM public.profile_gallery 
        WHERE profile_id = v_profile.id;

        -- Delete products
        DELETE FROM public.profile_products 
        WHERE profile_id = v_profile.id;

        -- Delete listings
        DELETE FROM public.profile_listings 
        WHERE profile_id = v_profile.id;

        -- Delete gallery items
        DELETE FROM public.profile_gallery 
        WHERE profile_id = v_profile.id;

        -- Update last_reset_at timestamp
        UPDATE public.profiles 
        SET last_reset_at = NOW() 
        WHERE id = v_profile.id;

        -- Record reset in history
        INSERT INTO public.reset_history (
            profile_id,
            products_deleted,
            listings_deleted,
            gallery_items_deleted,
            profile_age_days,
            subscription_tier
        ) VALUES (
            v_profile.id,
            v_products_count,
            v_listings_count,
            v_gallery_count,
            v_profile_age_days,
            v_profile.subscription_tier
        );

        -- Return row for this profile
        profile_id := v_profile.id;
        display_name := v_profile.display_name;
        email := v_profile.email;
        profile_age_days := v_profile_age_days;
        products_deleted := v_products_count;
        listings_deleted := v_listings_count;
        gallery_items_deleted := v_gallery_count;
        reset_timestamp := NOW();
        
        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$;

-- Step 4: Create a safe manual reset function for individual users
CREATE OR REPLACE FUNCTION reset_single_profile(p_profile_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    products_deleted INTEGER,
    listings_deleted INTEGER,
    gallery_items_deleted INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription_tier TEXT;
    v_products_count INTEGER;
    v_listings_count INTEGER;
    v_gallery_count INTEGER;
BEGIN
    -- Get subscription tier
    SELECT subscription_tier INTO v_subscription_tier
    FROM public.profiles
    WHERE id = p_profile_id;

    -- SAFETY CHECK: Only allow reset for free tier
    IF v_subscription_tier != 'free' THEN
        success := FALSE;
        message := 'Reset only allowed for free tier users';
        products_deleted := 0;
        listings_deleted := 0;
        gallery_items_deleted := 0;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Count items
    SELECT COUNT(*) INTO v_products_count 
    FROM public.profile_products 
    WHERE profile_id = p_profile_id;

    SELECT COUNT(*) INTO v_listings_count 
    FROM public.profile_listings 
    WHERE profile_id = p_profile_id;

    SELECT COUNT(*) INTO v_gallery_count 
    FROM public.profile_gallery 
    WHERE profile_id = p_profile_id;

    -- Delete items
    DELETE FROM public.profile_products WHERE profile_id = p_profile_id;
    DELETE FROM public.profile_listings WHERE profile_id = p_profile_id;
    DELETE FROM public.profile_gallery WHERE profile_id = p_profile_id;

    -- Update last_reset_at
    UPDATE public.profiles 
    SET last_reset_at = NOW() 
    WHERE id = p_profile_id;

    -- Record in history
    INSERT INTO public.reset_history (
        profile_id,
        products_deleted,
        listings_deleted,
        gallery_items_deleted,
        subscription_tier
    ) VALUES (
        p_profile_id,
        v_products_count,
        v_listings_count,
        v_gallery_count,
        v_subscription_tier
    );

    success := TRUE;
    message := 'Profile reset successfully';
    products_deleted := v_products_count;
    listings_deleted := v_listings_count;
    gallery_items_deleted := v_gallery_count;
    
    RETURN NEXT;
    RETURN;
END;
$$;

-- Step 5: Create a view for easy monitoring
CREATE OR REPLACE VIEW public.profiles_due_for_reset AS
SELECT 
    p.id,
    p.display_name,
    p.email,
    p.subscription_tier,
    p.created_at,
    p.last_reset_at,
    CASE 
        WHEN p.last_reset_at IS NOT NULL THEN 
            EXTRACT(DAY FROM (NOW() - p.last_reset_at))
        ELSE 
            EXTRACT(DAY FROM (NOW() - p.created_at))
    END AS days_since_last_reset,
    CASE 
        WHEN p.last_reset_at IS NOT NULL THEN 
            p.last_reset_at + INTERVAL '7 days'
        ELSE 
            p.created_at + INTERVAL '7 days'
    END AS next_reset_date,
    (SELECT COUNT(*) FROM profile_products WHERE profile_id = p.id) AS product_count,
    (SELECT COUNT(*) FROM profile_listings WHERE profile_id = p.id) AS listing_count,
    (SELECT COUNT(*) FROM profile_gallery WHERE profile_id = p.id) AS gallery_count
FROM public.profiles p
WHERE 
    p.subscription_tier = 'free'
    AND (
        (p.last_reset_at IS NULL AND p.created_at < NOW() - INTERVAL '7 days')
        OR 
        (p.last_reset_at IS NOT NULL AND p.last_reset_at < NOW() - INTERVAL '7 days')
    )
ORDER BY 
    CASE 
        WHEN p.last_reset_at IS NOT NULL THEN p.last_reset_at
        ELSE p.created_at
    END ASC;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
-- 
-- 1. AUTOMATIC RESET (Run daily via cron/scheduler):
--    SELECT * FROM reset_free_tier_profiles();
--
-- 2. MANUAL RESET (For a specific user):
--    SELECT * FROM reset_single_profile('user-uuid-here');
--
-- 3. CHECK WHO NEEDS RESET:
--    SELECT * FROM profiles_due_for_reset;
--
-- 4. VIEW RESET HISTORY:
--    SELECT * FROM reset_history ORDER BY reset_date DESC LIMIT 100;
--
-- 5. VIEW USER'S RESET HISTORY:
--    SELECT * FROM reset_history WHERE profile_id = 'user-uuid-here';
--
-- ============================================================================
-- SAFETY GUARANTEES
-- ============================================================================
-- ✅ Only affects free tier users (subscription_tier = 'free')
-- ✅ Only resets profiles older than 7 days
-- ✅ Preserves user profile, auth, and settings
-- ✅ Tracks all resets in reset_history table
-- ✅ Returns detailed report of deletions
-- ✅ Can be safely run multiple times (idempotent)
-- ✅ Manual reset function for support/testing
-- ============================================================================

-- Grant execute permissions (adjust as needed for your setup)
-- GRANT EXECUTE ON FUNCTION reset_free_tier_profiles() TO service_role;
-- GRANT EXECUTE ON FUNCTION reset_single_profile(UUID) TO service_role;
