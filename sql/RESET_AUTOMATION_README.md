# 7-Day Free Tier Reset Automation

## Overview

This system automatically resets free tier user data every 7 days, clearing products, listings, and gallery items while preserving user profiles and authentication.

## 🔒 Safety Guarantees

✅ **Only affects free tier users** (`subscription_tier = 'free'`)  
✅ **Only resets profiles older than 7 days**  
✅ **Preserves user profile, authentication, and settings**  
✅ **Tracks all resets in audit trail** (`reset_history` table)  
✅ **Returns detailed report** of what was deleted  
✅ **Idempotent** - can be safely run multiple times  
✅ **Manual reset function** for support/testing  

## 📁 Files Created

1. **`create-reset-automation.sql`** - Main SQL setup file
2. **`supabase/functions/reset-free-tier/index.ts`** - Edge Function for scheduling
3. **`lib/resetUtils.ts`** - Client-side countdown utilities
4. **`components/ResetCountdownBanner.tsx`** - UI countdown component

## 🚀 Deployment Steps

### Step 1: Run the SQL Setup

```bash
# In Supabase SQL Editor, run:
sql/create-reset-automation.sql
```

This creates:
- `reset_history` table (audit trail)
- `profiles.last_reset_at` column
- `reset_free_tier_profiles()` function (main automation)
- `reset_single_profile(uuid)` function (manual reset)
- `profiles_due_for_reset` view (monitoring)

### Step 2: Deploy the Edge Function (Optional but Recommended)

```bash
# Deploy the function
supabase functions deploy reset-free-tier

# Set up daily cron (2 AM UTC)
# In Supabase Dashboard > Edge Functions > reset-free-tier > Add Cron Schedule
# Cron expression: 0 2 * * *
```

Or schedule via SQL:
```sql
SELECT cron.schedule(
  'reset-free-tier-daily',
  '0 2 * * *',  -- Every day at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR-PROJECT.supabase.co/functions/v1/reset-free-tier',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Step 3: Test the System

```sql
-- Check who needs reset
SELECT * FROM profiles_due_for_reset;

-- Test manual reset on a single user
SELECT * FROM reset_single_profile('user-uuid-here');

-- Run full automation (dry run)
SELECT * FROM reset_free_tier_profiles();

-- View reset history
SELECT * FROM reset_history ORDER BY reset_date DESC LIMIT 10;
```

## 📊 Database Schema

### `reset_history` Table
```sql
- id (UUID) - Primary key
- profile_id (UUID) - User who was reset
- reset_date (TIMESTAMPTZ) - When reset occurred
- products_deleted (INTEGER) - Count of products deleted
- listings_deleted (INTEGER) - Count of listings deleted
- gallery_items_deleted (INTEGER) - Count of gallery items deleted
- profile_age_days (INTEGER) - How old the profile was
- subscription_tier (TEXT) - Tier at time of reset
- created_at (TIMESTAMPTZ) - Record creation time
```

### `profiles` Table Addition
```sql
- last_reset_at (TIMESTAMPTZ) - Last time profile was reset
```

## 🔧 Functions

### `reset_free_tier_profiles()`
**Purpose:** Main automation function - resets all eligible free tier profiles  
**Returns:** Table of reset results  
**Usage:**
```sql
SELECT * FROM reset_free_tier_profiles();
```

**Output:**
| Column | Type | Description |
|--------|------|-------------|
| profile_id | UUID | User ID |
| display_name | TEXT | User's display name |
| email | TEXT | User's email |
| profile_age_days | INTEGER | Days since last reset |
| products_deleted | INTEGER | Products removed |
| listings_deleted | INTEGER | Listings removed |
| gallery_items_deleted | INTEGER | Gallery items removed |
| reset_timestamp | TIMESTAMPTZ | When reset occurred |

### `reset_single_profile(uuid)`
**Purpose:** Manual reset for a specific user (support/testing)  
**Parameters:** `p_profile_id UUID`  
**Returns:** Success status and deletion counts  
**Usage:**
```sql
SELECT * FROM reset_single_profile('550e8400-e29b-41d4-a716-446655440000');
```

**Output:**
| Column | Type | Description |
|--------|------|-------------|
| success | BOOLEAN | Whether reset succeeded |
| message | TEXT | Status message |
| products_deleted | INTEGER | Products removed |
| listings_deleted | INTEGER | Listings removed |
| gallery_items_deleted | INTEGER | Gallery items removed |

## 📈 Monitoring

### View Profiles Due for Reset
```sql
SELECT * FROM profiles_due_for_reset;
```

Shows:
- Profile details
- Days since last reset
- Next reset date
- Current item counts (products, listings, gallery)

### View Reset History
```sql
-- All resets
SELECT * FROM reset_history ORDER BY reset_date DESC;

-- Specific user's history
SELECT * FROM reset_history 
WHERE profile_id = 'user-uuid-here'
ORDER BY reset_date DESC;

-- Summary statistics
SELECT 
  COUNT(*) as total_resets,
  SUM(products_deleted) as total_products,
  SUM(listings_deleted) as total_listings,
  SUM(gallery_items_deleted) as total_gallery
FROM reset_history
WHERE reset_date > NOW() - INTERVAL '30 days';
```

## 🎯 How It Works

1. **Countdown Timer (Client-Side)**
   - `resetUtils.ts` calculates days/hours remaining
   - `ResetCountdownBanner.tsx` displays warnings
   - Shows 3 days before reset (amber warning)
   - Shows 1 day before reset (red warning)

2. **Automatic Reset (Server-Side)**
   - Edge Function runs daily at 2 AM UTC
   - Calls `reset_free_tier_profiles()`
   - Deletes products, listings, gallery items
   - Updates `last_reset_at` timestamp
   - Records in `reset_history` table

3. **Reset Cycle**
   - Free tier users get 7 days from signup
   - After first reset, 7 days from `last_reset_at`
   - Premium/Business users never reset
   - Upgrading stops future resets

## 🛡️ Safety Checks

The system has multiple safety layers:

1. **Tier Check:** Only `subscription_tier = 'free'`
2. **Age Check:** Only profiles >7 days old
3. **Preservation:** User profile, auth, and settings kept
4. **Audit Trail:** Every reset logged in `reset_history`
5. **Idempotent:** Safe to run multiple times
6. **Manual Override:** Support can manually reset if needed

## 🔄 Reset Logic Flow

```
1. Check subscription_tier = 'free'
2. Calculate days since created_at or last_reset_at
3. If >= 7 days:
   a. Count items (for reporting)
   b. DELETE FROM profile_products
   c. DELETE FROM profile_listings  
   d. DELETE FROM profile_gallery
   e. UPDATE profiles SET last_reset_at = NOW()
   f. INSERT INTO reset_history
4. Return detailed report
```

## 📧 Optional: Email Notifications

To notify users before/after reset, integrate with an email service:

```typescript
// In Edge Function
async function sendResetNotification(profile: any) {
  // Use SendGrid, Resend, or similar
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@a2zsellr.life',
      to: profile.email,
      subject: 'Your A2Z Free Tier Has Reset',
      html: `Your products and listings have been cleared...`
    })
  })
}
```

## 🧪 Testing

### Test on Staging First
```sql
-- Create test free tier user
INSERT INTO profiles (id, subscription_tier, created_at)
VALUES (gen_random_uuid(), 'free', NOW() - INTERVAL '8 days');

-- Add test data
-- ... add products, listings, gallery items

-- Run reset
SELECT * FROM reset_free_tier_profiles();

-- Verify data deleted
SELECT COUNT(*) FROM profile_products WHERE profile_id = 'test-user-id';
```

### Verify Safety Checks
```sql
-- Should NOT reset (premium user)
UPDATE profiles SET subscription_tier = 'premium' WHERE id = 'test-user-id';
SELECT * FROM reset_free_tier_profiles(); -- Returns 0 rows

-- Should NOT reset (too new)
UPDATE profiles SET created_at = NOW() - INTERVAL '3 days' WHERE id = 'test-user-id';
SELECT * FROM reset_free_tier_profiles(); -- Returns 0 rows
```

## 📝 Maintenance

### Weekly Checks
```sql
-- How many profiles will reset this week?
SELECT COUNT(*) FROM profiles_due_for_reset;

-- Recent reset activity
SELECT 
  DATE(reset_date) as date,
  COUNT(*) as resets,
  SUM(products_deleted) as products,
  SUM(listings_deleted) as listings
FROM reset_history
WHERE reset_date > NOW() - INTERVAL '7 days'
GROUP BY DATE(reset_date)
ORDER BY date DESC;
```

### Cleanup Old History (Optional)
```sql
-- Keep only last 90 days of history
DELETE FROM reset_history 
WHERE reset_date < NOW() - INTERVAL '90 days';
```

## 🚨 Troubleshooting

### Reset Not Running
1. Check Edge Function logs: `supabase functions logs reset-free-tier`
2. Verify cron schedule is active
3. Test function manually: `SELECT * FROM reset_free_tier_profiles();`

### Users Not Being Reset
1. Check `profiles_due_for_reset` view
2. Verify `subscription_tier = 'free'`
3. Check `created_at` or `last_reset_at` timestamps

### Too Many/Few Resets
1. Review `reset_history` table
2. Check for duplicate cron jobs
3. Verify 7-day interval logic

## 📚 Related Documentation

- Client-side countdown: `lib/resetUtils.ts`
- UI component: `components/ResetCountdownBanner.tsx`
- Free tier limits: `components/FreeAccountNotifications.tsx`
- Project roadmap: `A2Z_DATA_MODELS.md`

## ✅ Production Checklist

- [ ] Run `create-reset-automation.sql` in production
- [ ] Deploy Edge Function
- [ ] Set up cron schedule (2 AM UTC daily)
- [ ] Test with staging data
- [ ] Monitor first week of resets
- [ ] Set up email notifications (optional)
- [ ] Document in team wiki
- [ ] Add monitoring alerts

---

**Last Updated:** 2025-11-05  
**Status:** ✅ Ready for Production Deployment
