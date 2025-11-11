-- 7-DAY FREE TIER RESET (CONFIRMED WORKING)
-- This function deletes products, listings, and gallery items for free tier users after 7 days
-- Tested and confirmed working on 2025-11-11

-- Drop old function if exists
DROP FUNCTION IF EXISTS reset_free_tier_daily();

-- Create the 7-day reset function
CREATE OR REPLACE FUNCTION reset_free_tier_daily()
RETURNS TABLE(
    reset_profile_id UUID,
    reset_display_name TEXT,
    reset_products_deleted INTEGER,
    reset_listings_deleted INTEGER,
    reset_gallery_deleted INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_products_count INTEGER;
    v_listings_count INTEGER;
    v_gallery_count INTEGER;
BEGIN
    -- Loop through all free tier profiles that need reset (7 days)
    FOR v_profile IN 
        SELECT p.id, p.display_name, p.subscription_tier
        FROM public.profiles p
        WHERE p.subscription_tier = 'free'
            AND ((p.last_reset_at IS NULL AND p.created_at < NOW() - INTERVAL '7 days')
                OR (p.last_reset_at IS NOT NULL AND p.last_reset_at < NOW() - INTERVAL '7 days'))
    LOOP
        -- Count items before deletion
        SELECT COUNT(*) INTO v_products_count FROM public.profile_products pp WHERE pp.profile_id = v_profile.id;
        SELECT COUNT(*) INTO v_listings_count FROM public.profile_listings pl WHERE pl.profile_id = v_profile.id;
        SELECT COUNT(*) INTO v_gallery_count FROM public.profile_gallery pg WHERE pg.profile_id = v_profile.id;

        -- Delete all content
        DELETE FROM public.profile_products pp WHERE pp.profile_id = v_profile.id;
        DELETE FROM public.profile_listings pl WHERE pl.profile_id = v_profile.id;
        DELETE FROM public.profile_gallery pg WHERE pg.profile_id = v_profile.id;

        -- Update last_reset_at timestamp
        UPDATE public.profiles SET last_reset_at = NOW() WHERE id = v_profile.id;

        -- Record in history
        INSERT INTO public.reset_history (profile_id, products_deleted, listings_deleted, gallery_items_deleted, subscription_tier)
        VALUES (v_profile.id, v_products_count, v_listings_count, v_gallery_count, v_profile.subscription_tier);

        -- Return results
        reset_profile_id := v_profile.id;
        reset_display_name := v_profile.display_name;
        reset_products_deleted := v_products_count;
        reset_listings_deleted := v_listings_count;
        reset_gallery_deleted := v_gallery_count;
        RETURN NEXT;
    END LOOP;
END;
$$;

-- Test function to manually trigger reset for a specific user
CREATE OR REPLACE FUNCTION test_reset_user(user_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    products_deleted INTEGER,
    listings_deleted INTEGER,
    gallery_deleted INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_products_count INTEGER;
    v_listings_count INTEGER;
    v_gallery_count INTEGER;
BEGIN
    -- Count items
    SELECT COUNT(*) INTO v_products_count 
    FROM public.profile_products 
    WHERE profile_id = user_id;

    SELECT COUNT(*) INTO v_listings_count 
    FROM public.profile_listings 
    WHERE profile_id = user_id;

    SELECT COUNT(*) INTO v_gallery_count 
    FROM public.profile_gallery 
    WHERE profile_id = user_id;

    -- Delete everything
    DELETE FROM public.profile_products WHERE profile_id = user_id;
    DELETE FROM public.profile_listings WHERE profile_id = user_id;
    DELETE FROM public.profile_gallery WHERE profile_id = user_id;

    -- Update timestamp
    UPDATE public.profiles 
    SET last_reset_at = NOW() 
    WHERE id = user_id;

    -- Return results
    success := TRUE;
    products_deleted := v_products_count;
    listings_deleted := v_listings_count;
    gallery_deleted := v_gallery_count;
    
    RETURN NEXT;
END;
$$;
