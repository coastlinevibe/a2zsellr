-- Update products table and create tags system
-- This allows users to create custom tags with icons and select from existing ones

-- First, create a tags table for reusable tags
CREATE TABLE IF NOT EXISTS product_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(100), -- URL or icon class name
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for tag display
    created_by UUID REFERENCES profiles(id),
    is_system_tag BOOLEAN DEFAULT false, -- For predefined tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for many-to-many relationship between products and tags
CREATE TABLE IF NOT EXISTS product_tag_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES profile_products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, tag_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_product_id ON product_tag_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_tag_id ON product_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_name ON product_tags(name);

-- Insert some common system tags to get started
INSERT INTO product_tags (name, icon, color, is_system_tag) VALUES
('Services', '🔧', '#10B981', true),
('Products', '📦', '#3B82F6', true),
('Digital', '💻', '#8B5CF6', true),
('Physical', '📋', '#F59E0B', true),
('Software', '⚡', '#06B6D4', true),
('Consulting', '💡', '#EF4444', true),
('Education', '📚', '#84CC16', true),
('Health', '🏥', '#EC4899', true),
('Food', '🍕', '#F97316', true),
('Fashion', '👕', '#A855F7', true)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing type data to tags (if type column has data)
-- First, create tags from existing type values
INSERT INTO product_tags (name, is_system_tag)
SELECT DISTINCT type, true
FROM profile_products 
WHERE type IS NOT NULL AND type != ''
ON CONFLICT (name) DO NOTHING;

-- Then assign these tags to products
INSERT INTO product_tag_assignments (product_id, tag_id)
SELECT p.id, pt.id
FROM profile_products p
JOIN product_tags pt ON pt.name = p.type
WHERE p.type IS NOT NULL AND p.type != '';

-- Now we can safely drop the type column
ALTER TABLE profile_products DROP COLUMN IF EXISTS type;

-- Create a view for easy querying of products with their tags
CREATE OR REPLACE VIEW products_with_tags AS
SELECT 
    p.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', pt.id,
                'name', pt.name,
                'icon', pt.icon,
                'color', pt.color
            )
        ) FILTER (WHERE pt.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM profile_products p
LEFT JOIN product_tag_assignments pta ON p.id = pta.product_id
LEFT JOIN product_tags pt ON pta.tag_id = pt.id
GROUP BY p.id;

-- Function to add a tag to a product
CREATE OR REPLACE FUNCTION add_product_tag(
    p_product_id UUID,
    p_tag_name VARCHAR(50),
    p_tag_icon VARCHAR(100) DEFAULT NULL,
    p_tag_color VARCHAR(7) DEFAULT '#3B82F6',
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    tag_id UUID;
BEGIN
    -- Try to find existing tag
    SELECT id INTO tag_id FROM product_tags WHERE name = p_tag_name;
    
    -- If tag doesn't exist, create it
    IF tag_id IS NULL THEN
        INSERT INTO product_tags (name, icon, color, created_by)
        VALUES (p_tag_name, p_tag_icon, p_tag_color, p_user_id)
        RETURNING id INTO tag_id;
    END IF;
    
    -- Assign tag to product (ignore if already assigned)
    INSERT INTO product_tag_assignments (product_id, tag_id)
    VALUES (p_product_id, tag_id)
    ON CONFLICT (product_id, tag_id) DO NOTHING;
    
    RETURN tag_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove a tag from a product
CREATE OR REPLACE FUNCTION remove_product_tag(
    p_product_id UUID,
    p_tag_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM product_tag_assignments 
    WHERE product_id = p_product_id AND tag_id = p_tag_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security) if needed
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth setup)
CREATE POLICY "Users can view all tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Users can create tags" ON product_tags FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Users can update their own tags" ON product_tags FOR UPDATE USING (auth.uid() = created_by OR is_system_tag = false);

CREATE POLICY "Users can view tag assignments" ON product_tag_assignments FOR SELECT USING (true);
CREATE POLICY "Users can manage their product tags" ON product_tag_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profile_products 
        WHERE profile_products.id = product_tag_assignments.product_id 
        AND profile_products.profile_id = auth.uid()
    )
);