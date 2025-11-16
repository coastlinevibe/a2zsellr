# Profiles Table Analysis & Optimization

## Current Table Structure (from your data)

### Actively Used Columns ✅
These columns are actively used in the codebase:

1. **id** - UUID primary key
2. **display_name** - Business/user display name (USED)
3. **email** - User email (USED)
4. **phone_number** - Contact phone (USED)
5. **bio** - Business description (USED)
6. **avatar_url** - Profile picture (USED)
7. **website_url** - Business website (USED)
8. **business_category** - Category slug (USED)
9. **business_location** - Location slug (USED)
10. **subscription_tier** - free/premium/business (USED)
11. **subscription_status** - active/cancelled/expired (USED)
12. **verified_seller** - Boolean flag (USED)
13. **is_active** - Boolean flag (USED)
14. **current_listings** - Count of active listings (USED)
15. **is_admin** - Admin flag (USED)
16. **created_at** - Timestamp (USED)
17. **updated_at** - Timestamp (USED)
18. **last_free_reset** - Last reset date (USED)
19. **referral_code** - Referral tracking (USED)

### Unused/Redundant Columns ❌
These columns are NOT used in the codebase:

1. **business_hours** - Stored as JSON string, never queried
2. **subscription_start_date** - Never used
3. **subscription_end_date** - Never used
4. **trial_end_date** - Never used
5. **location_id** - Foreign key, but business_location is used instead
6. **category_id** - Foreign key, but business_category is used instead
7. **last_reset_at** - Duplicate of last_free_reset
8. **payment_method** - Never used
9. **payment_reference** - Never used
10. **payment_status** - Never used (orders table has this)
11. **proof_of_payment_url** - Never used
12. **payfast_customer_id** - Never used
13. **last_payment_date** - Never used
14. **address** - Never used (orders table has shipping_address)

## Recommendations

### 1. Remove Unused Columns (Safe to Delete)
```sql
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
```

### 2. Add Missing Useful Columns
```sql
-- Add columns for better business management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_revenue_cents INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
```

### 3. Optimize Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_business_category ON profiles(business_category);
CREATE INDEX IF NOT EXISTS idx_profiles_business_location ON profiles(business_location);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_seller ON profiles(verified_seller);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
```

### 4. Update RLS Policies
```sql
-- Ensure proper RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view active profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view active profiles" ON profiles
  FOR SELECT USING (is_active = true);
```

## Summary

- **Total Columns**: 35
- **Used Columns**: 19
- **Unused Columns**: 14 (40% bloat)
- **Recommended Action**: Remove unused columns, add analytics columns, optimize indexes

This will reduce table size, improve query performance, and clean up the schema.
