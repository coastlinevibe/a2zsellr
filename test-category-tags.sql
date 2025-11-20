-- Test the category-specific tag system

-- Check how many tags we have for each category
SELECT 
  category,
  COUNT(*) as tag_count,
  COUNT(CASE WHEN is_system_tag = true THEN 1 END) as system_tags,
  COUNT(CASE WHEN is_system_tag = false THEN 1 END) as user_tags
FROM product_tags 
GROUP BY category
ORDER BY category;

-- Show sample tags for products category
SELECT name, icon, color, category 
FROM product_tags 
WHERE category = 'products' 
ORDER BY name 
LIMIT 20;

-- Show sample tags for services category
SELECT name, icon, color, category 
FROM product_tags 
WHERE category = 'services' 
ORDER BY name 
LIMIT 20;

-- Show general/uncategorized tags
SELECT name, icon, color, category 
FROM product_tags 
WHERE category IS NULL OR category = 'general'
ORDER BY name;