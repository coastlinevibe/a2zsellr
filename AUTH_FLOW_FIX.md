# Authentication Flow Fix

## Issue
The authentication flow had a broken redirect sequence:
1. User creates account → signup success screen
2. User clicks "Create Account" on login → goes to signup
3. After signup, user is auto-logged in
4. Gets redirected to `/profile` page (wrong)
5. Then somehow ends up at `/onboarding` (confusing)

## Root Cause
- **Signup page** was redirecting to `/profile` instead of `/onboarding`
- **Login page** was always redirecting to `/onboarding` regardless of onboarding status
- This caused new users to skip onboarding and go straight to profile

## Solution

### 1. Fixed Login Page (`app/auth/login-animated/page.tsx`)
**Before:**
```typescript
if (data.user) {
  // Always redirect to onboarding
  router.push('/onboarding')
}
```

**After:**
```typescript
if (data.user) {
  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .single()

  // If onboarding not completed, go to onboarding, otherwise go to dashboard
  if (profile && !profile.onboarding_completed) {
    router.push('/onboarding')
  } else {
    router.push('/dashboard')
  }
}
```

### 2. Fixed Signup Page (`app/auth/signup-animated/page.tsx`)
**Before:**
```typescript
// Redirect to profile page
router.push('/profile')
```

**After:**
```typescript
// Redirect to onboarding page
router.push('/onboarding')
```

## New Auth Flow

### New User (First Time)
1. User signs up → Signup success screen
2. Auto-login happens
3. Redirects to `/onboarding` ✅
4. Completes onboarding
5. Redirects to `/dashboard` ✅

### Returning User (Already Completed Onboarding)
1. User logs in
2. System checks `onboarding_completed` flag
3. If true → Redirects to `/dashboard` ✅
4. If false → Redirects to `/onboarding` ✅

### User Clicking "Create Account" on Login Page
1. Clicks "Create Account" link
2. Goes to signup page
3. Creates account
4. Signup success screen shows
5. Auto-login happens
6. Redirects to `/onboarding` ✅
7. Completes onboarding
8. Redirects to `/dashboard` ✅

## Files Modified
- `app/auth/login-animated/page.tsx` - Added onboarding status check
- `app/auth/signup-animated/page.tsx` - Changed redirect from `/profile` to `/onboarding`

## Status
✅ **COMPLETE** - Auth flow now correctly routes users through onboarding
