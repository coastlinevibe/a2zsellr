-- A2Z Business Directory - Database Performance Optimization
-- This script creates indexes and optimizations to improve query performance

-- =====================================================
-- PROFILES TABLE OPTIMIZATIONS
-- =====================================================

-- Index for active profiles search (most common query)
CREATE INDEX IF NOT EXISTS idx_profiles_active_subscription 
ON profiles (is_active, subscription_tier) 
WHERE is_active = true;

-- Index for business search by category and location
CREATE INDEX IF NOT EXISTS idx_profiles_business_search 
ON profiles (business_category, business_location, is_active) 
WHERE is_active = true;

-- Index for verified sellers (priority sorting)
CREATE INDEX IF NOT EXISTS idx_profiles_verified_updated 
ON profiles (verified_seller DESC, updated_at DESC) 
WHERE is_active = true;

-- Full-text search index for business names and descriptions
CREATE INDEX IF NOT EXISTS idx_profiles_search_text 
ON profiles USING gin(to_tsvector('english', display_name || ' ' || COALESCE(bio, '')));

-- Index for profile lookups by username
CREATE INDEX IF NOT EXISTS idx_profiles_display_name 
ON profiles (display_name) 
WHERE display_name IS NOT NULL;

-- =====================================================
-- PROFILE_PRODUCTS TABLE OPTIMIZATIONS
-- =====================================================

-- Index for recent activities (ticker functionality)
CREATE INDEX IF NOT EXISTS idx_profile_products_recent 
ON profile_products (created_at DESC, profile_id) 
WHERE name IS NOT NULL AND name != '';

-- Index for product search by profile
CREATE INDEX IF NOT EXISTS idx_profile_products_by_profile 
ON profile_products (profile_id, created_at DESC);

-- Full-text search for products
CREATE INDEX IF NOT EXISTS idx_profile_products_search 
ON profile_products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- PROFILE_GALLERY TABLE OPTIMIZATIONS
-- =====================================================

-- Index for gallery images by profile (most common join)
CREATE INDEX IF NOT EXISTS idx_profile_gallery_profile 
ON profile_gallery (profile_id, created_at DESC);

-- Index for active gallery images
CREATE INDEX IF NOT EXISTS idx_profile_gallery_active 
ON profile_gallery (profile_id) 
WHERE image_url IS NOT NULL;

-- =====================================================
-- CATEGORIES TABLE OPTIMIZATIONS
-- =====================================================

-- Index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active 
ON categories (is_active, name) 
WHERE is_active = true;

-- Index for category slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON categories (slug) 
WHERE is_active = true;

-- =====================================================
-- LOCATIONS TABLE OPTIMIZATIONS
-- =====================================================

-- Index for active locations
CREATE INDEX IF NOT EXISTS idx_locations_active 
ON locations (is_active, city) 
WHERE is_active = true;

-- Index for location slug lookups
CREATE INDEX IF NOT EXISTS idx_locations_slug 
ON locations (slug) 
WHERE is_active = true;

-- =====================================================
-- PROFILE_ANALYTICS TABLE OPTIMIZATIONS
-- =====================================================

-- Index for analytics by profile and date (most common query)
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_date 
ON profile_analytics (profile_id, date DESC);

-- Index for daily analytics lookups
CREATE INDEX IF NOT EXISTS idx_profile_analytics_date 
ON profile_analytics (date DESC);

-- =====================================================
-- PERFORMANCE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active businesses with basic info (cached frequently)
CREATE OR REPLACE VIEW active_businesses AS
SELECT 
    id,
    display_name,
    bio,
    avatar_url,
    business_category,
    business_location,
    business_hours,
    subscription_tier,
    verified_seller,
    created_at,
    updated_at
FROM profiles 
WHERE is_active = true 
  AND display_name IS NOT NULL 
  AND subscription_tier IN ('free', 'premium', 'business');

-- View for recent product activities (for ticker)
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    pp.id,
    pp.name,
    pp.created_at,
    pp.profile_id,
    p.display_name as profile_name
FROM profile_products pp
JOIN profiles p ON pp.profile_id = p.id
WHERE pp.name IS NOT NULL 
  AND pp.name != ''
  AND p.is_active = true
ORDER BY pp.created_at DESC
LIMIT 50;

-- =====================================================
-- MATERIALIZED VIEW FOR BUSINESS DIRECTORY (OPTIONAL)
-- =====================================================

-- Materialized view for business directory (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS business_directory AS
SELECT 
    p.id,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.business_category,
    p.business_location,
    p.business_hours,
    p.subscription_tier,
    p.verified_seller,
    p.created_at,
    p.updated_at,
    COUNT(pg.id) as image_count,
    COUNT(pp.id) as product_count
FROM profiles p
LEFT JOIN profile_gallery pg ON p.id = pg.profile_id
LEFT JOIN profile_products pp ON p.id = pp.profile_id
WHERE p.is_active = true 
  AND p.display_name IS NOT NULL 
  AND p.subscription_tier IN ('free', 'premium', 'business')
GROUP BY p.id, p.display_name, p.bio, p.avatar_url, p.business_category, 
         p.business_location, p.business_hours, p.subscription_tier, 
         p.verified_seller, p.created_at, p.updated_at;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_business_directory_search 
ON business_directory (business_category, business_location, verified_seller DESC, updated_at DESC);

-- =====================================================
-- FUNCTIONS FOR BETTER PERFORMANCE
-- =====================================================

-- Function to refresh materialized view (call periodically)
CREATE OR REPLACE FUNCTION refresh_business_directory()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY business_directory;
END;
$$ LANGUAGE plpgsql;

-- Function for fast business search
CREATE OR REPLACE FUNCTION search_businesses(
    search_query text DEFAULT '',
    category_filter text DEFAULT 'all',
    location_filter text DEFAULT 'all',
    result_limit integer DEFAULT 24
)
RETURNS TABLE (
    id uuid,
    display_name text,
    bio text,
    avatar_url text,
    business_category text,
    business_location text,
    business_hours text,
    subscription_tier text,
    verified_seller boolean,
    updated_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.display_name,
        p.bio,
        p.avatar_url,
        p.business_category,
        p.business_location,
        p.business_hours,
        p.subscription_tier::text,
        p.verified_seller,
        p.updated_at
    FROM profiles p
    WHERE p.is_active = true
      AND p.display_name IS NOT NULL
      AND p.subscription_tier IN ('free', 'premium', 'business')
      AND (category_filter = 'all' OR p.business_category = category_filter)
      AND (location_filter = 'all' OR p.business_location = location_filter)
      AND (
          search_query = '' OR 
          p.display_name ILIKE '%' || search_query || '%' OR
          p.bio ILIKE '%' || search_query || '%' OR
          p.business_category ILIKE '%' || search_query || '%' OR
          p.business_location ILIKE '%' || search_query || '%'
      )
    ORDER BY p.verified_seller DESC, p.updated_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYZE TABLES FOR BETTER QUERY PLANNING
-- =====================================================

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE profile_products;
ANALYZE profile_gallery;
ANALYZE categories;
ANALYZE locations;
ANALYZE profile_analytics;

-- =====================================================
-- PERFORMANCE MONITORING QUERIES
-- =====================================================

-- Query to check index usage
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan DESC;

-- Query to check slow queries
-- SELECT query, calls, total_time, mean_time, rows
-- FROM pg_stat_statements 
-- WHERE query LIKE '%profiles%' 
-- ORDER BY mean_time DESC 
-- LIMIT 10;

-- =====================================================
-- CLEANUP COMMANDS (RUN PERIODICALLY)
-- =====================================================

-- Vacuum and analyze tables (run during low traffic periods)
-- VACUUM ANALYZE profiles;
-- VACUUM ANALYZE profile_products;
-- VACUUM ANALYZE profile_gallery;
-- VACUUM ANALYZE categories;
-- VACUUM ANALYZE locations;

-- Refresh materialized view (run every hour or as needed)
-- SELECT refresh_business_directory();

COMMIT;
