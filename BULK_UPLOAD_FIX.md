# Bulk Upload Authentication Fix

## Problem
When bulk uploading users via CSV, the system was creating profiles with random UUIDs first, then trying to create auth users and update the profile IDs. This failed because:

1. **Primary key cannot be updated** - PostgreSQL doesn't allow updating primary keys
2. **Profile ID ≠ Auth User ID** - This caused a mismatch where profiles existed but couldn't be logged into
3. **New profiles created on login** - When trying to login, the system created a NEW profile for the auth user instead of using the existing one

## Solution
Changed the order of operations in `app/api/admin/bulk-upload/route.ts`:

### Before (WRONG):
1. Create profiles with random UUIDs
2. Create auth users (different UUIDs)
3. Try to update profile ID ❌ (fails - can't update primary key)

### After (CORRECT):
1. ✅ Create auth users FIRST
2. ✅ Use auth user's UUID as the profile ID
3. ✅ Create profiles with matching IDs

## What Changed

### File: `app/api/admin/bulk-upload/route.ts`

**Key Changes:**
- Auth users are now created BEFORE profiles
- Profile IDs now match auth user IDs from the start
- Removed the broken "update profile ID" logic
- Better error handling for failed auth creations
- Changed default tier from 'business' to 'premium'

## Cleanup Required

Since you already uploaded 20 users with the broken system, you need to clean them up:

### Option 1: Automated Cleanup (Recommended)
```bash
node cleanup-duplicate-profiles.js
```

This script will:
- Find all profiles without matching auth users
- Show you which profiles will be deleted
- Ask for confirmation (type "DELETE")
- Delete profiles, products, gallery, and listings
- Keep profiles that have valid auth users

### Option 2: Manual Cleanup via Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Note which users exist in Auth
3. Go to Table Editor → profiles
4. Delete profiles whose IDs don't match any auth user IDs

## Re-uploading After Cleanup

After cleanup, you can re-upload your CSV:

1. Go to `/admin` in your browser
2. Click "BULK UPLOAD" tab
3. Select your CSV file
4. Click "PREVIEW DATA"
5. Review the data
6. Click "CONFIRM & CREATE"

### Default Credentials
- **Password**: `123456` (for all bulk uploaded users)
- **Email**: Uses email from CSV, or auto-generates if missing
- **Tier**: Premium (unlimited products, full e-commerce)

## Testing Login

After re-uploading, test login:

1. Go to login page
2. Use email from CSV (e.g., `business@example.com`)
3. Use password: `123456`
4. Should login successfully to the correct profile

## Verification

To verify the fix worked:

```sql
-- Run this in Supabase SQL Editor
SELECT 
  p.id as profile_id,
  p.display_name,
  p.email,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Has Auth'
    ELSE '❌ No Auth'
  END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
```

All profiles should show "✅ Has Auth".

## Prevention

This fix ensures:
- ✅ Every profile has a matching auth user
- ✅ Profile ID = Auth User ID (always)
- ✅ Users can login with their credentials
- ✅ No duplicate profiles created on login
- ✅ Proper error handling if auth creation fails

## Notes

- Profiles without successful auth creation are skipped (not created)
- Failed auth attempts are logged in the response
- The system now validates auth creation before profile creation
- Service role key is required for creating auth users
