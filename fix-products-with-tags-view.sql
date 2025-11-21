-- Fix products_with_tags view to properly parse images JSON field
-- This will make product images display correctly in profile views

-- Drop and recreate the view with proper JSON parsing for images
DROP VIEW IF EXISTS products_with_tags;

CREATE OR REPLACE VIEW products_with_tags AS
SELECT 
    p.*,
    -- Parse images JSON field if it exists
    CASE 
        WHEN p.images IS NOT NULL AND p.images != '' THEN
            CASE 
                WHEN p.images::text LIKE '[%]' THEN p.images::json
                ELSE '[]'::json
            END
        ELSE '[]'::json
    END as images,
    -- Keep the tags aggregation
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', pt.id,
                'name', pt.name,
                'icon', pt.icon,
                'color', pt.color,
                'is_system_tag', pt.is_system_tag
            )
        ) FILTER (WHERE pt.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM profile_products p
LEFT JOIN product_tag_assignments pta ON p.id = pta.product_id
LEFT JOIN product_tags pt ON pta.tag_id = pt.id
GROUP BY p.id, p.profile_id, p.name, p.description, p.price_cents, p.image_url, p.images, p.is_active, p.created_at, p.updated_at, p.category, p.product_details;