# Profiles Table - Essential Columns Only

## ✅ KEEP THESE COLUMNS (Essential)

### Core Identity
- **`id`** - Primary key (UUID from Supabase Auth)
- **`display_name`** - User's display name
- **`email`** - User's email address
- **`bio`** - User's business description
- **`avatar_url`** - Profile picture URL

### Contact Information
- **`phone_number`** - Contact phone
- **`website_url`** - Business website
- **`facebook`** - Facebook page URL
- **`instagram`** - Instagram handle
- **`twitter`** - Twitter handle
- **`youtube`** - YouTube channel

### Business Details
- **`business_category`** - What type of business (Animals, Food, etc.)
- **`business_location`** - Where the business is located
- **`business_hours`** - Operating hours (JSON format)

### Subscription & Status
- **`subscription_tier`** - free/premium/business
- **`subscription_status`** - active/cancelled/expired
- **`trial_end_date`** - When free trial expires (24 hours)
- **`verified_seller`** - Verification badge
- **`is_active`** - Account status
- **`is_admin`** - Admin privileges

### Analytics & Tracking
- **`current_listings`** - Number of active listings (auto-updated)
- **`last_free_reset`** - When free user was last reset
- **`referral_code`** - User's referral code

### Timestamps
- **`created_at`** - Account creation date
- **`updated_at`** - Last profile update

## ❌ REMOVE THESE COLUMNS (Unused/Redundant)

### Unused Subscription Fields
- ~~`subscription_start_date`~~ - Not used
- ~~`subscription_end_date`~~ - Not used

### Redundant Location Fields
- ~~`location_id`~~ - We use `business_location` instead
- ~~`category_id`~~ - We use `business_category` instead

### Unused Reset Fields
- ~~`last_reset_at`~~ - We use `last_free_reset` instead

### Unused Payment Fields (Handled in separate tables)
- ~~`payment_method`~~ - Payments handled in `payments` table
- ~~`payment_reference`~~ - Payments handled in `payments` table
- ~~`payment_status`~~ - Payments handled in `payments` table
- ~~`proof_of_payment_url`~~ - Payments handled in `payments` table
- ~~`payfast_customer_id`~~ - Payments handled in `payments` table
- ~~`last_payment_date`~~ - Payments handled in `payments` table

### Unused Address Field
- ~~`address`~~ - We use `business_location` instead

## 📊 AFTER CLEANUP: 22 Essential Columns

The profiles table will go from **33 columns** to **22 columns** - a **33% reduction** in bloat!

## 🎯 Benefits
- **Cleaner queries** - Less data to fetch
- **Better performance** - Smaller row size
- **Easier maintenance** - Less confusion
- **Clearer purpose** - Each column has a clear use case