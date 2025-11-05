# ✅ Premium Tier - Quick Test Checklist

**Fast 15-Minute Test - Essential Features Only**

---

## 🚀 Quick Setup (5 minutes)

### 1. Register Account
- [ ] Go to `/auth/signup-animated`
- [ ] Email: `premium.test@example.com`
- [ ] Password: `Test123!@#`
- [ ] Sign up successful

### 2. Set Premium Tier (Use Admin Account)
- [ ] Open Supabase Dashboard (or login as admin: `admin@out.com` / `201555`)
- [ ] Go to Table Editor → `profiles` table
- [ ] Find your profile (`premium.test@example.com`)
- [ ] Click on the row to edit
- [ ] Change `subscription_tier` from `free` to `premium`
- [ ] Save changes
- [ ] Go back to app and refresh dashboard

### 3. Complete Profile
- [ ] Display Name: `Premium Test Business`
- [ ] Fill in phone, email, website
- [ ] Select category
- [ ] Save profile
- [ ] **Verify:** Premium badge shows

---

## 🖼️ Test Gallery - Unlimited (2 minutes)

- [ ] Go to Gallery tab
- [ ] Upload image 1
- [ ] Upload image 2
- [ ] Upload image 3
- [ ] Upload image 4 (would fail on free)
- [ ] Upload image 5
- [ ] **Verify:** "Unlimited" badge shows
- [ ] **Verify:** No limit errors

---

## 🛍️ Test Products - Unlimited (3 minutes)

- [ ] Go to Shop tab
- [ ] Add Product 1: `Test Product 1`, Price: `29999` (R 299.99)
- [ ] Add Product 2: `Test Product 2`, Price: `49999`
- [ ] Add Product 3: `Test Product 3`, Price: `19999`
- [ ] Add Product 4: `Test Product 4`, Price: `59999`
- [ ] Add Product 5: `Test Product 5`, Price: `39999`
- [ ] Add Product 6: `Test Product 6`, Price: `79999` (would fail on free)
- [ ] **Verify:** "Unlimited" badge shows
- [ ] **Verify:** No limit errors

---

## 🛒 Test E-Commerce (3 minutes)

### As Customer (Incognito Window):
- [ ] Open incognito window
- [ ] Go to your business profile
- [ ] Click "Add to Cart" on Product 1
- [ ] Click "Add to Cart" on Product 2
- [ ] **Verify:** Cart badge shows "2"
- [ ] Click cart icon
- [ ] **Verify:** Cart drawer opens with items
- [ ] Click "Proceed to Checkout"
- [ ] Fill in customer info: `Test Customer`, `test@test.com`
- [ ] Fill in address: `123 Test St`, `Johannesburg`, `Gauteng`, `2000`
- [ ] Select payment: PayFast
- [ ] Click "Place Order"
- [ ] **Verify:** Order created, order number shows
- [ ] **Verify:** Redirected to `/orders` page

---

## 📢 Test Marketing - Unlimited (2 minutes)

- [ ] Go to Marketing tab
- [ ] Create Listing 1: `Sale - 20% Off`
- [ ] Create Listing 2: `New Product Launch`
- [ ] Create Listing 3: `Customer Review`
- [ ] Create Listing 4: `Weekend Special` (would fail on free)
- [ ] **Verify:** "Unlimited" badge shows
- [ ] **Verify:** No day restriction warnings
- [ ] **Verify:** Can save on any day (including Wed/Sat/Sun)

---

## ✅ Final Verification (1 minute)

### Premium Features Active:
- [ ] Premium badge visible in header
- [ ] No reset timer visible
- [ ] Gallery shows "Unlimited"
- [ ] Shop shows "Unlimited"
- [ ] Marketing shows "Unlimited"
- [ ] No day restrictions
- [ ] Cart button in navigation
- [ ] Orders page accessible

### Database Check:
- [ ] Open Supabase Dashboard
- [ ] Check `profiles`: subscription_tier = 'premium'
- [ ] Check `profile_gallery`: 5+ images
- [ ] Check `profile_products`: 6+ products
- [ ] Check `profile_listings`: 4+ listings
- [ ] Check `orders`: 1+ order
- [ ] Check `order_items`: 2+ items

---

## 🎯 Success Criteria

**Test PASSES if:**
- ✅ Can upload 5+ images (no limits)
- ✅ Can add 6+ products (no limits)
- ✅ Can create 4+ listings (no limits)
- ✅ No reset timer
- ✅ No day restrictions
- ✅ Cart and checkout work
- ✅ Order created successfully
- ✅ All "Unlimited" badges visible

---

## 🐛 Quick Troubleshooting

**Premium badge not showing?**
→ Check `subscription_tier = 'premium'` in database, refresh page

**Still seeing limits?**
→ Verify tier is exactly `'premium'` (lowercase), restart app

**Cart not working?**
→ Check CartProvider in layout.tsx, clear cache

**Orders not creating?**
→ Check Supabase connection, verify tables exist

---

**Time:** 15 minutes  
**Full Guide:** `PREMIUM_TIER_TESTING_GUIDE.md`  
**Status:** Ready to test! 🚀
