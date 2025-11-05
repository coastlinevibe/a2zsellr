# 🔐 Admin Account Setup Guide

**Quick guide to access admin dashboard and manage user tiers**

---

## 👤 Admin Account Credentials

**Email:** `admin@out.com`  
**Password:** `201555`

---

## 🚀 Quick Start - Access Admin Dashboard

### Step 1: Login as Admin

1. **Navigate to login page:**
   ```
   http://localhost:3000/auth/login-animated
   ```

2. **Enter credentials:**
   - Email: `admin@out.com`
   - Password: `201555`

3. **Click "Log In"**

4. **Expected Result:**
   - ✅ Logged in successfully
   - ✅ Redirected to admin dashboard

---

## 🎯 How to Change User Subscription Tiers

### Method 1: Via Supabase Dashboard (Current Method)

1. **Open Supabase Dashboard:**
   - Go to your Supabase project
   - Click "Table Editor" in sidebar

2. **Navigate to profiles table:**
   - Click on `profiles` table
   - You'll see all user profiles

3. **Find the user:**
   - Use search/filter to find user by email or name
   - Or scroll through the list

4. **Edit subscription tier:**
   - Click on the user's row
   - Find `subscription_tier` column
   - Change value to:
     - `free` - Free tier (3 images, 5 products, 3 listings, 7-day reset)
     - `premium` - Premium tier (unlimited, no reset, R99/month)
     - `business` - Business tier (unlimited + advanced features, R299/month)
   - Click save/update

5. **User refreshes their dashboard:**
   - Changes take effect immediately
   - Premium/Business badges appear
   - Unlimited features activate

---

## 📋 Testing Premium Tier - Updated Steps

### Quick Setup (2 minutes):

1. **Create Test Account:**
   - Go to `/auth/signup-animated`
   - Email: `premium.test@example.com`
   - Password: `Test123!@#`
   - Sign up

2. **Set to Premium Tier:**
   - **Option A - Supabase Dashboard:**
     - Open Supabase → Table Editor → profiles
     - Find `premium.test@example.com`
     - Change `subscription_tier` to `premium`
     - Save
   
   - **Option B - Admin Dashboard (if available):**
     - Login as admin (`admin@out.com`)
     - Go to admin dashboard
     - Find user
     - Change tier to premium
     - Save

3. **Test as Premium User:**
   - Logout from admin
   - Login as `premium.test@example.com`
   - Go to dashboard
   - **Verify:**
     - ✅ Premium badge shows
     - ✅ No reset timer
     - ✅ "Unlimited" badges on Gallery/Shop/Marketing

---

## 🔧 Admin Dashboard Features (If Implemented)

If you have an admin dashboard at `/admin`, you can:

- **View all users** with their tiers
- **Change subscription tiers** with one click
- **Toggle verified seller status**
- **View user statistics**
- **Search and filter users**

**Access:** `http://localhost:3000/admin` (if route exists)

---

## 📊 Subscription Tier Comparison

| Feature | Free | Premium | Business |
|---------|------|---------|----------|
| **Price** | R0 | R99/month | R299/month |
| **Gallery Images** | 3 | Unlimited | Unlimited |
| **Products** | 5 | Unlimited | Unlimited |
| **Listings** | 3 | Unlimited | Unlimited |
| **Reset Timer** | 7 days | None | None |
| **Share Days** | Wed/Sat/Sun | Any day | Any day |
| **E-Commerce** | ✅ | ✅ | ✅ |
| **Google Maps** | ✅ | ✅ | ✅ |
| **Multi-Location** | ❌ | ❌ | ✅ |
| **Analytics** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ |

---

## 🧪 Testing Workflow

### For Premium Tier Testing:

1. **Login as admin** (`admin@out.com`)
2. **Create test user** or use existing user
3. **Set tier to premium** via Supabase
4. **Logout from admin**
5. **Login as test user**
6. **Follow testing guide:** `PREMIUM_TEST_CHECKLIST.md`

### For Business Tier Testing:

1. Same as above, but set `subscription_tier` to `business`
2. Test multi-location features (when implemented)
3. Test advanced analytics (when implemented)

---

## 🔐 Security Notes

### Admin Account:
- Keep credentials secure
- Don't share admin password
- Change password in production
- Consider 2FA for production

### Tier Changes:
- Changes are immediate
- No payment processing yet (manual tier management)
- Users don't get notified of tier changes (add notification system later)

---

## 🚀 Next Steps

### For Testing Now:
1. ✅ Use admin account to access Supabase
2. ✅ Change user tiers manually in database
3. ✅ Test premium features with test accounts

### For Production Later:
- [ ] Implement payment processing (PayFast)
- [ ] Auto-upgrade on successful payment
- [ ] Email notifications on tier changes
- [ ] Admin dashboard UI for tier management
- [ ] Subscription management page for users
- [ ] Billing history and invoices

---

## 📚 Related Documentation

- **Premium Testing:** `PREMIUM_TEST_CHECKLIST.md` (15-min test)
- **Full Testing:** `PREMIUM_TIER_TESTING_GUIDE.md` (30-45 min test)
- **E-Commerce:** `ECOMMERCE_QUICKSTART.md`
- **Project Overview:** `A2Z_DATA_MODELS.md`

---

## ✅ Quick Reference

### Admin Login:
```
URL: http://localhost:3000/auth/login-animated
Email: admin@out.com
Password: 201555
```

### Change User Tier:
```
1. Supabase Dashboard
2. Table Editor → profiles
3. Find user
4. Edit subscription_tier
5. Save
```

### Test Account:
```
Email: premium.test@example.com
Password: Test123!@#
Tier: Set to 'premium' after signup
```

---

**Ready to test!** Use admin account to manage tiers, then follow the premium testing guides. 🚀
