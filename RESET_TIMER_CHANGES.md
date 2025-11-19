# Reset Timer Changes - 5 Minute Testing Mode

## Summary
Successfully updated the free tier reset system from 24 hours to 5 minutes for testing purposes. The system now automatically resets user data every 5 minutes and preserves user profile information.

## Changes Made

### 1. Reset Utilities (`lib/resetUtils.ts`)
- ✅ Changed reset interval from weekly (Sunday) to every 5 minutes
- ✅ Updated time calculations to use minutes and seconds instead of days and hours
- ✅ Modified warning thresholds (2 minutes warning, 1 minute critical)
- ✅ Updated reset message formatting to show `Xm Ys` format

### 2. Trial Manager (`lib/trialManager.ts`)
- ✅ Changed trial duration from 24 hours to 5 minutes
- ✅ Added `resetUserData()` function to handle automatic data clearing
- ✅ Updated `formatTimeRemaining()` to show minutes and seconds
- ✅ Modified renewal function to extend by 5 minutes instead of 24 hours

### 3. Trial Timer Component (`components/TrialTimer.tsx`)
- ✅ Updated refresh interval from 1 minute to 1 second for real-time countdown
- ✅ Added automatic reset trigger when trial expires
- ✅ Integrated with `resetUserData()` function

### 4. Reset Timer Component (`components/ResetTimer.tsx`)
- ✅ Updated display logic to show minutes and seconds
- ✅ Modified color coding for different time thresholds
- ✅ Removed 7-day limit check (now always shows for free users)

### 5. Reset Countdown Banner (`components/ResetCountdownBanner.tsx`)
- ✅ Updated messaging to reflect 5-minute intervals
- ✅ Changed from "every Sunday" to "every 5 minutes for testing"

### 6. Database Migrations
- ✅ Updated `add_trial_end_date.sql` to set 5 minutes instead of 24 hours
- ✅ Updated `clean_profiles_table.sql` to use 5-minute intervals
- ✅ Created `create_reset_function.sql` for automated reset processing

### 7. Documentation (`README.md`)
- ✅ Updated all references from 7-day to 5-minute resets
- ✅ Added "TESTING MODE" labels throughout
- ✅ Updated feature descriptions and restrictions

### 8. Test Files
- ✅ Created `test-reset.js` for manual testing
- ✅ Created `app/test-timer/page.tsx` for UI testing
- ✅ Updated existing reset system functions

## What Gets Reset
When the 5-minute timer expires, the system automatically:
- ✅ Deletes all `profile_products`
- ✅ Deletes all `profile_listings` 
- ✅ Deletes all `profile_gallery` items
- ✅ Deletes all `profile_analytics` data
- ✅ Resets `current_listings` to 0
- ✅ Resets `profile_views` to 0
- ✅ Updates `last_free_reset` timestamp
- ✅ Extends `trial_end_date` by 5 minutes

## What Gets Preserved
The user profile information remains intact:
- ✅ User authentication and login
- ✅ Profile details (name, email, bio, etc.)
- ✅ Business information and location
- ✅ Subscription tier and settings
- ✅ Contact information and social links

## How to Test
1. Visit `/test-timer` page when logged in as a free user
2. Watch the real-time countdown (updates every second)
3. Use "Manual Reset" button to trigger immediate reset
4. Use "Check Status" button to see current trial status
5. Wait for automatic reset when timer reaches 0

## Timer Display
- **> 3 minutes**: Blue background, shows `Xm Ys`
- **1-3 minutes**: Amber background, shows `Xm Ys` 
- **< 1 minute**: Red background, shows `Ys`
- **Expired**: Green background, shows "RESET DONE"

## Next Steps
- The system is ready for testing
- Monitor the `/test-timer` page to verify functionality
- Check database to confirm data is being cleared and restored properly
- Adjust timing if needed (currently set to 5 minutes)
- Can easily revert to 24 hours or any other interval by updating the constants

## Files Modified
- `lib/resetUtils.ts`
- `lib/trialManager.ts` 
- `components/TrialTimer.tsx`
- `components/ResetTimer.tsx`
- `components/ResetCountdownBanner.tsx`
- `supabase/migrations/add_trial_end_date.sql`
- `supabase/migrations/clean_profiles_table.sql`
- `README.md`

## Files Created
- `supabase/migrations/create_reset_function.sql`
- `test-reset.js`
- `app/test-timer/page.tsx`
- `RESET_TIMER_CHANGES.md`