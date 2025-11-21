# Complete Database Structure Analysis

## SQL Queries to Run for Understanding ALL Database Structure

### 1. Get All Tables in Database
```sql
-- List all tables in the public schema
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Get Complete Schema for All Tables
```sql
-- Get detailed schema for ALL tables
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
ORDER BY t.table_name, c.ordinal_position;
```

### 3. Get Foreign Key Relationships
```sql
-- Get all foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
ORDER BY tc.table_name;
```

### 4. Check Storage Buckets and Objects
```sql
-- Check storage buckets
SELECT name, id, created_at, updated_at, public
FROM storage.buckets
ORDER BY name;
```

```sql
-- Check storage objects (sample from each bucket)
SELECT 
    bucket_id,
    name,
    metadata,
    created_at,
    updated_at
FROM storage.objects 
ORDER BY bucket_id, created_at DESC
LIMIT 20;
```

### 5. Sample Data from Key Tables

#### Profiles Table
```sql
SELECT * FROM profiles LIMIT 3;
```

#### Profile Listings Table  
```sql
SELECT * FROM profile_listings LIMIT 3;
```

#### Profile Products Table
```sql
SELECT * FROM profile_products LIMIT 3;
```

#### Profile Gallery Table
```sql
SELECT * FROM profile_gallery LIMIT 3;
```

### 6. Check for Media/Content Related Tables
```sql
-- Find tables that might contain media/content data
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%media%' OR 
    table_name LIKE '%upload%' OR 
    table_name LIKE '%image%' OR 
    table_name LIKE '%video%' OR 
    table_name LIKE '%file%' OR
    table_name LIKE '%gallery%' OR
    table_name LIKE '%campaign%' OR
    table_name LIKE '%content%'
)
ORDER BY table_name;
```

### 7. Check Table Row Counts
```sql
-- Get row counts for all tables to understand data volume
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "rows"
FROM pg_stat_user_tables 
ORDER BY n_tup_ins DESC;
```

### 8. Check for JSON/JSONB Columns (for complex data)
```sql
-- Find JSON/JSONB columns that might store structured data
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND data_type IN ('json', 'jsonb')
ORDER BY table_name, column_name;
```

### 9. Check Indexes
```sql
-- Get all indexes to understand performance optimizations
SELECT 
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM 
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE 
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname NOT LIKE 'pg_%'
ORDER BY t.relname, i.relname;
```

### 10. Check Views
```sql
-- Get all views in the database
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Expected Results Analysis

After running these queries, we'll have complete understanding of:

1. **All Tables**: Complete list of every table in your database
2. **Table Schemas**: Every column, data type, constraints for all tables
3. **Relationships**: How tables connect via foreign keys
4. **Storage Structure**: All buckets and sample file organization
5. **Data Volume**: How much data is in each table
6. **JSON Fields**: Complex data structures already in use
7. **Indexes**: Performance optimizations in place
8. **Views**: Any computed/virtual tables

## Key Areas to Focus On

### For Video/Menu Implementation:
- **Media Storage Pattern**: How images/files are currently handled
- **Profile vs Listing Data**: What's stored globally vs per-campaign
- **JSON Usage**: If complex data structures are already used
- **Storage Buckets**: Current organization and naming conventions

### For Global Toggle Feature:
- **Profile Table**: Available columns for global settings
- **Listing Table**: Current structure for per-campaign data
- **Relationship Patterns**: How profile and listing data connects

## Next Steps After Analysis

Based on the complete results, we'll:
1. **Map Current Architecture**: Understand existing patterns
2. **Design Schema Changes**: Add video/menu fields following current conventions
3. **Plan Storage Strategy**: Organize video/menu files in existing bucket structure
4. **Implement Global Toggles**: Add fields for global vs per-listing preferences

---
*Run ALL these queries in your Supabase SQL editor and paste the complete results back here for analysis.*

## Results Section
*Paste query results below:*

### 1. All Tables:
```json
[
  {"table_name": "admin_payment_overview", "table_type": "VIEW"},
  {"table_name": "analytics_events", "table_type": "BASE TABLE"},
  {"table_name": "campaign_analytics", "table_type": "VIEW"},
  {"table_name": "campaign_executions", "table_type": "BASE TABLE"},
  {"table_name": "campaign_groups", "table_type": "BASE TABLE"},
  {"table_name": "categories", "table_type": "BASE TABLE"},
  {"table_name": "customer_rewards", "table_type": "BASE TABLE"},
  {"table_name": "eft_banking_details", "table_type": "BASE TABLE"},
  {"table_name": "locations", "table_type": "BASE TABLE"},
  {"table_name": "marketing_campaigns", "table_type": "BASE TABLE"},
  {"table_name": "order_items", "table_type": "BASE TABLE"},
  {"table_name": "orders", "table_type": "BASE TABLE"},
  {"table_name": "payment_transactions", "table_type": "BASE TABLE"},
  {"table_name": "product_tag_assignments", "table_type": "BASE TABLE"},
  {"table_name": "product_tags", "table_type": "BASE TABLE"},
  {"table_name": "products_with_tags", "table_type": "VIEW"},
  {"table_name": "profile_analytics", "table_type": "BASE TABLE"},
  {"table_name": "profile_gallery", "table_type": "BASE TABLE"},
  {"table_name": "profile_listings", "table_type": "BASE TABLE"},
  {"table_name": "profile_products", "table_type": "BASE TABLE"},
  {"table_name": "profile_reviews", "table_type": "BASE TABLE"},
  {"table_name": "profiles", "table_type": "BASE TABLE"},
  {"table_name": "profiles_due_for_reset", "table_type": "VIEW"},
  {"table_name": "referrals", "table_type": "BASE TABLE"},
  {"table_name": "reset_history", "table_type": "BASE TABLE"},
  {"table_name": "reward_programs", "table_type": "BASE TABLE"},
  {"table_name": "social_media_groups", "table_type": "BASE TABLE"},
  {"table_name": "subscription_pricing", "table_type": "BASE TABLE"},
  {"table_name": "system_settings", "table_type": "BASE TABLE"},
  {"table_name": "templates", "table_type": "BASE TABLE"},
  {"table_name": "user_templates", "table_type": "BASE TABLE"}
]
```

**Summary:**
- **Total Tables:** 31
- **Base Tables:** 26 (actual data tables)
- **Views:** 5 (computed/virtual tables)

**Key Tables for Video/Menu Implementation:**
- `profiles` - User/business profiles (global settings)
- `profile_listings` - Marketing campaigns/listings (per-campaign settings)
- `profile_gallery` - Media/image storage
- `profile_products` - Product catalog
- `marketing_campaigns` - Campaign management
- `templates` - Template system

### 2. Key Tables Schema:

#### profiles table:
- `id` (uuid, primary key)
- `display_name` (text, required)
- `bio` (text, optional)
- `avatar_url` (text, optional)
- `phone_number` (text, optional)
- `email` (text, optional)
- `website_url` (text, optional)
- `business_category` (text, optional)
- `business_location` (text, optional)
- `business_hours` (jsonb, optional)
- `subscription_tier` (text, default: 'free')
- `subscription_status` (text, default: 'active')
- `trial_end_date` (timestamp, optional)
- `current_listings` (integer, default: 0)
- `last_free_reset` (timestamp, optional)
- `verified_seller` (boolean, default: false)
- `is_active` (boolean, default: true)
- `created_at` (timestamp, default: now())
- `updated_at` (timestamp, default: now())
- `is_admin` (boolean, default: false)
- `referral_code` (varchar, optional)
- `facebook` (text, optional)
- `instagram` (text, optional)
- `twitter` (text, optional)
- `youtube` (text, optional)

#### profile_listings table:
- `id` (uuid, primary key)
- `profile_id` (uuid, foreign key)
- `title` (text, required)
- `layout_type` (text, required)
- `listing_id` (uuid, optional)
- `message_template` (text, required)
- `cta_label` (text, optional)
- `cta_url` (text, optional)
- `scheduled_for` (timestamp, optional)
- `status` (text, default: 'draft')
- `metrics` (jsonb, default: {'delivered': 0, 'read': 0, 'clicked': 0})
- `created_at` (timestamp, default: now())
- `updated_at` (timestamp, default: now())
- `target_platforms` (array, default: ['whatsapp'])
- `platform_settings` (jsonb, complex platform config)
- `url_slug` (text, optional)
- `uploaded_media` (jsonb, default: [])
- `selected_products` (jsonb, default: [])
- `template_id` (uuid, optional)
- `template_data` (jsonb, default: {})
- `delivery_available` (boolean, default: false)

#### profile_gallery table:
- `id` (uuid, primary key)
- `profile_id` (uuid, foreign key)
- `image_url` (text, required)
- `caption` (text, optional)
- `sort_order` (integer, default: 0)
- `is_active` (boolean, default: true)
- `created_at` (timestamp, default: now())
- `updated_at` (timestamp, default: now())

### 3. Foreign Keys:
```
[Paste results here]
```

### 4. Storage Buckets:
```json
[
  {
    "name": "gallery",
    "id": "gallery",
    "created_at": "2025-11-01 19:47:28.664994+00",
    "updated_at": "2025-11-01 19:47:28.664994+00",
    "public": true
  },
  {
    "name": "payment-proofs",
    "id": "payment-proofs",
    "created_at": "2025-11-06 08:49:38.898698+00",
    "updated_at": "2025-11-06 08:49:38.898698+00",
    "public": true
  },
  {
    "name": "product-images",
    "id": "product-images",
    "created_at": "2025-11-05 19:25:43.104188+00",
    "updated_at": "2025-11-05 19:25:43.104188+00",
    "public": true
  },
  {
    "name": "profile",
    "id": "profile",
    "created_at": "2025-10-21 08:19:44.125974+00",
    "updated_at": "2025-10-21 08:19:44.125974+00",
    "public": true
  },
  {
    "name": "sharelinks",
    "id": "sharelinks",
    "created_at": "2025-11-04 05:37:38.205969+00",
    "updated_at": "2025-11-04 05:37:38.205969+00",
    "public": true
  },
  {
    "name": "templates",
    "id": "templates",
    "created_at": "2025-11-08 07:39:35.700717+00",
    "updated_at": "2025-11-08 07:39:35.700717+00",
    "public": true
  }
]
```

**Storage Bucket Analysis:**
- **Total Buckets:** 6
- **All Public:** Yes (all buckets are publicly accessible)
- **Bucket Purposes:**
  - `gallery` - Profile gallery images
  - `payment-proofs` - Payment verification files
  - `product-images` - Product photos
  - `profile` - Profile-related files (avatars, etc.)
  - `sharelinks` - Campaign/marketing content
  - `templates` - Template files

**Video Storage Strategy:**
Based on existing structure, we have several options:
1. **Use `sharelinks` bucket** - Already used for campaign content
2. **Use `gallery` bucket** - For media files
3. **Create new `videos` bucket** - Dedicated video storage

**Menu Images Storage:**
- **Option 1:** `gallery` bucket (fits with media theme)
- **Option 2:** `sharelinks` bucket (campaign-related content)
- **Option 3:** `product-images` bucket (menu items are products)

### 5. Sample Data:
```
[Paste results here]
```

### 6. Media Tables:
```
[Paste results here]
```

### 7. Row Counts:
```
[Paste results here]
```

### 8. JSON Columns:
```
[Paste results here]
```

### 9. Indexes:
```
[Paste results here]
```

### 10. Views:
```
[Paste results here]
```