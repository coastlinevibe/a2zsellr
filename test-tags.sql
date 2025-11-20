-- Add some test tags to existing products
-- This will help us see the tags in action

-- First, let's see what products exist
-- SELECT id, name, profile_id FROM profile_products LIMIT 5;

-- Add tags to the first product (replace the product_id with an actual one from your database)
-- You can run this after checking what products exist in your database

-- Example: If you have a product with ID 'some-uuid-here', run:
-- SELECT add_product_tag('some-uuid-here', 'Premium', '⭐', '#FFD700', 'fb37f61c-315a-4716-830c-0cfbedf5191a');
-- SELECT add_product_tag('some-uuid-here', 'Featured', '🔥', '#FF4500', 'fb37f61c-315a-4716-830c-0cfbedf5191a');

-- Or manually insert if you know the product ID:
-- First, create some tags if they don't exist
INSERT INTO product_tags (name, icon, color, is_system_tag) VALUES
('Premium', '⭐', '#FFD700', true),
('Featured', '🔥', '#FF4500', true),
('New', '✨', '#00FF00', true),
('Popular', '👑', '#8A2BE2', true)
ON CONFLICT (name) DO NOTHING;

-- Then assign tags to products (you'll need to replace 'your-product-id' with actual product IDs)
-- INSERT INTO product_tag_assignments (product_id, tag_id)
-- SELECT 'your-product-id', id FROM product_tags WHERE name IN ('Premium', 'Featured')
-- ON CONFLICT (product_id, tag_id) DO NOTHING;

-- To see all products and their tags:
SELECT * FROM products_with_tags LIMIT 5;