-- ============================================================================
-- A2Z BUSINESS DIRECTORY - COMPLETE DATABASE MIGRATIONS
-- Run these in order in your Supabase SQL console
-- ============================================================================

-- ============================================================================
-- 1. FIX ORDER NUMBER GENERATION
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- 2. FIX ORDER ITEM TOTAL CALCULATION
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_order_item_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_price_cents IS NULL THEN
    NEW.total_price_cents := NEW.unit_price_cents * NEW.quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_item_total ON order_items;
CREATE TRIGGER set_order_item_total
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION calculate_order_item_total();

ALTER TABLE order_items
ALTER COLUMN total_price_cents SET DEFAULT 0;

-- ============================================================================
-- 3. FIX RLS POLICIES FOR ORDERS TABLE
-- ============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Businesses can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id 
    OR customer_id IS NULL
    OR auth.uid() = business_id
  );

CREATE POLICY "Businesses can update their orders" ON public.orders
  FOR UPDATE USING (auth.uid() = business_id)
  WITH CHECK (auth.uid() = business_id);

-- ============================================================================
-- 4. FIX RLS POLICIES FOR ORDER_ITEMS TABLE
-- ============================================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (true);

-- ============================================================================
-- 5. ADD INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================================
-- 6. OPTIMIZE PROFILES TABLE (OPTIONAL - REMOVES UNUSED COLUMNS)
-- ============================================================================
-- WARNING: This removes columns that are not used in the codebase
-- Backup your database before running this section

-- Remove unused columns
ALTER TABLE profiles DROP COLUMN IF EXISTS business_hours;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_start_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_end_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS trial_end_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS location_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS category_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_reset_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_method;
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_reference;
ALTER TABLE profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE profiles DROP COLUMN IF EXISTS proof_of_payment_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS payfast_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_payment_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS address;

-- Add analytics columns for future use
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_revenue_cents INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_business_category ON profiles(business_category);
CREATE INDEX IF NOT EXISTS idx_profiles_business_location ON profiles(business_location);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_seller ON profiles(verified_seller);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- ============================================================================
-- 7. VERIFY MIGRATIONS
-- ============================================================================
-- Run these queries to verify everything is working:

-- Check order number trigger
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'set_order_number';

-- Check order item total trigger
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'set_order_item_total';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- SELECT * FROM pg_policies WHERE tablename = 'order_items';

-- Check indexes
-- SELECT * FROM pg_indexes WHERE tablename = 'orders';
-- SELECT * FROM pg_indexes WHERE tablename = 'order_items';
-- SELECT * FROM pg_indexes WHERE tablename = 'profiles';

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
