# 🎯 Premium Tier - Complete Testing Guide

**Complete End-to-End Test: Registration → Profile → Content → Shopping → Marketing**

---

## 📋 Test Overview

This guide walks you through testing ALL premium tier features from scratch:
1. ✅ Registration & Profile Setup
2. ✅ Gallery Management (Unlimited)
3. ✅ Product Management (Unlimited)
4. ✅ E-Commerce (Shopping Cart & Orders)
5. ✅ Marketing Campaigns & Listings
6. ✅ Sharing & Publishing

**Estimated Time:** 30-45 minutes  
**Prerequisites:** App running (`npm run dev`)

---

# 🚀 PHASE 1: Registration & Profile Setup

## Step 1.1: Create New Account

1. **Navigate to signup:**
   ```
   http://localhost:3000/auth/signup-animated
   ```

2. **Fill in registration form:**
   - Email: `premium.test@example.com`
   - Password: `Test123!@#`
   - Click "Sign Up"

3. **Verify email (if required):**
   - Check email inbox
   - Click verification link
   - Or skip if email verification is disabled

4. **Expected Result:**
   - ✅ Account created successfully
   - ✅ Redirected to dashboard
   - ✅ Welcome message displayed

---

## Step 1.2: Complete Profile Setup

1. **Navigate to Profile tab** (should be default)

2. **Fill in basic information:**
   - **Display Name:** `Premium Test Business`
   - **Bio:** `Testing premium tier features with unlimited content`
   - **Phone:** `+27 12 345 6789`
   - **Email:** `contact@premiumtest.co.za`
   - **Website:** `https://premiumtest.co.za`
   - **Category:** Select `Retail` or any category
   - **Location:** `Johannesburg, Gauteng`

3. **Upload profile picture:**
   - Click profile picture area
   - Select an image
   - Crop if needed
   - Save

4. **Click "Save Profile"**

5. **Expected Result:**
   - ✅ Profile saved successfully
   - ✅ Profile completeness shows ~80-90%
   - ✅ All fields populated

---

## Step 1.3: Upgrade to Premium Tier

**IMPORTANT:** You need to manually set the subscription tier in the database using the admin account:

1. **Open Supabase Dashboard:**
   - Login to Supabase (or use admin account: `admin@out.com` / `201555`)
   - Go to Table Editor
   - Select `profiles` table
   - Find your profile (search by email: `premium.test@example.com`)

2. **Update subscription tier:**
   - Click on the row to edit
   - Find the `subscription_tier` column
   - Change value from `free` to `premium`
   - Click save/update button

3. **Refresh the dashboard page in your app**

4. **Expected Result:**
   - ✅ Premium badge appears next to your name
   - ✅ No reset timer visible
   - ✅ "Unlimited" badges appear on limits

**Note:** See `ADMIN_SETUP_GUIDE.md` for detailed admin instructions

---

# 🖼️ PHASE 2: Gallery Management (Test Unlimited)

## Step 2.1: Navigate to Gallery Tab

1. Click **"Gallery"** tab in dashboard
2. You should see:
   - Gallery showcase (empty initially)
   - Upload section
   - "Unlimited images" indicator

---

## Step 2.2: Upload Multiple Images (Test Premium Limit)

**Goal:** Verify you can upload more than 3 images (free tier limit)

1. **Upload Image 1:**
   - Click "Upload Images" or drag & drop
   - Select image 1
   - Add caption: `Premium Gallery Image 1`
   - Click "Upload"

2. **Upload Image 2:**
   - Repeat process
   - Caption: `Premium Gallery Image 2`

3. **Upload Image 3:**
   - Repeat process
   - Caption: `Premium Gallery Image 3`

4. **Upload Image 4:** (This would fail on free tier)
   - Repeat process
   - Caption: `Premium Gallery Image 4`

5. **Upload Image 5:**
   - Repeat process
   - Caption: `Premium Gallery Image 5`

6. **Expected Result:**
   - ✅ All 5+ images uploaded successfully
   - ✅ No "limit reached" error
   - ✅ Counter shows "5 images + Unlimited badge"
   - ✅ Gallery slider displays all images

---

## Step 2.3: Test Gallery Features

1. **View Gallery Showcase:**
   - Images display in slider
   - Navigation arrows work
   - Captions visible

2. **Edit an Image:**
   - Click "Manage" mode
   - Edit caption of any image
   - Save changes

3. **Delete an Image:**
   - Click delete on one image
   - Confirm deletion
   - Verify image removed

4. **Expected Result:**
   - ✅ All gallery features working
   - ✅ Still shows "Unlimited" badge

---

# 🛍️ PHASE 3: Product Management (Test Unlimited)

## Step 3.1: Navigate to Shop Tab

1. Click **"Shop"** tab in dashboard
2. You should see:
   - Empty shop or existing products
   - "Add Product" button
   - "Unlimited products" indicator

---

## Step 3.2: Add Multiple Products (Test Premium Limit)

**Goal:** Verify you can add more than 5 products (free tier limit)

### Product 1:
1. Click **"Add Product"**
2. Fill in details:
   - **Name:** `Premium Product 1`
   - **Description:** `High-quality product for premium customers`
   - **Price:** `R 299.99` (enter as `29999` cents)
   - **Category:** `Products`
   - **Image URL:** (optional) paste image URL
3. Click **"Add Product"**

### Product 2:
- **Name:** `Premium Product 2`
- **Price:** `R 499.99` (49999 cents)
- **Category:** `Products`

### Product 3:
- **Name:** `Premium Product 3`
- **Price:** `R 199.99` (19999 cents)
- **Category:** `Services`

### Product 4:
- **Name:** `Premium Product 4`
- **Price:** `R 599.99` (59999 cents)
- **Category:** `Products`

### Product 5:
- **Name:** `Premium Product 5`
- **Price:** `R 399.99` (39999 cents)
- **Category:** `Retail Items`

### Product 6: (Would fail on free tier)
- **Name:** `Premium Product 6`
- **Price:** `R 799.99` (79999 cents)
- **Category:** `Products`

### Product 7:
- **Name:** `Premium Product 7`
- **Price:** `R 149.99` (14999 cents)
- **Category:** `Services`

4. **Expected Result:**
   - ✅ All 7+ products added successfully
   - ✅ No "limit reached" error
   - ✅ Counter shows "7 products + Unlimited badge"
   - ✅ Products display in grid

---

## Step 3.3: Test Product Features

1. **View Products:**
   - All products visible in grid
   - Prices display correctly
   - Categories show

2. **Edit a Product:**
   - Click "Manage Products"
   - Edit any product
   - Change price or description
   - Save changes

3. **Share a Product:**
   - Click share icon on product
   - Copy share link
   - Verify link works

4. **Expected Result:**
   - ✅ All product features working
   - ✅ Still shows "Unlimited" badge

---

# 🛒 PHASE 4: E-Commerce Testing

## Step 4.1: Test Shopping Cart (As Customer)

**Open incognito/private window to test as customer:**

1. **Navigate to your business profile:**
   ```
   http://localhost:3000/business/[your-username]
   ```
   Or find your profile in directory

2. **View Shop Tab:**
   - See all your products
   - Prices visible
   - "Add to Cart" buttons visible

3. **Add Products to Cart:**
   - Click "Add to Cart" on Product 1
   - See confirmation alert
   - Cart badge shows "1"
   - Add Product 2 to cart
   - Cart badge shows "2"
   - Add Product 3 to cart
   - Cart badge shows "3"

4. **Expected Result:**
   - ✅ Cart button appears in navigation
   - ✅ Badge shows correct count
   - ✅ Confirmation alerts appear

---

## Step 4.2: View Cart

1. **Click cart icon** (top right)
2. Cart drawer slides out
3. **Verify cart contents:**
   - All 3 products listed
   - Grouped by your business name
   - Quantities show as "1" each
   - Prices correct
   - Subtotal calculated

4. **Test quantity controls:**
   - Click "+" on Product 1 → quantity becomes 2
   - Click "-" on Product 1 → quantity becomes 1
   - Click trash icon on Product 3 → removed from cart

5. **Expected Result:**
   - ✅ Cart displays correctly
   - ✅ Quantity controls work
   - ✅ Remove item works
   - ✅ Subtotal updates

---

## Step 4.3: Complete Checkout

1. **Click "Proceed to Checkout"**
2. Redirected to checkout page

3. **Fill in Customer Information:**
   - **Name:** `Test Customer`
   - **Email:** `customer@test.com`
   - **Phone:** `+27 11 111 1111`

4. **Fill in Shipping Address:**
   - **Address:** `123 Test Street`
   - **City:** `Johannesburg`
   - **Province:** `Gauteng`
   - **Postal Code:** `2000`
   - **Notes:** `Please ring doorbell`

5. **Select Payment Method:**
   - Choose "PayFast" (or "EFT")

6. **Review Order Summary:**
   - Verify items listed
   - Check subtotal
   - Verify VAT (15%)
   - Check total

7. **Click "Place Order"**

8. **Expected Result:**
   - ✅ Order created successfully
   - ✅ Order number displayed (A2Z-YYYYMMDD-XXXX)
   - ✅ Cart cleared
   - ✅ Redirected to orders page

---

## Step 4.4: View Orders

1. **On orders page:**
   - See your order listed
   - Order number visible
   - Status: "Pending"
   - Payment Status: "Payment Pending"
   - Total amount correct

2. **Click "View Details"** (if available)
   - See full order information

3. **Expected Result:**
   - ✅ Order appears in database
   - ✅ Order details correct
   - ✅ Status tracking visible

---

## Step 4.5: Verify Order in Database (Business Owner)

**Close incognito window, return to your dashboard:**

1. **Check Supabase Dashboard:**
   - Go to Table Editor
   - Select `orders` table
   - Find order by order_number
   - Verify all details correct

2. **Check Order Items:**
   - Select `order_items` table
   - Find items by order_id
   - Verify products, quantities, prices

3. **Expected Result:**
   - ✅ Order in database
   - ✅ Order items in database
   - ✅ All data accurate

---

# 📢 PHASE 5: Marketing Campaigns & Listings

## Step 5.1: Navigate to Marketing Tab

1. **Click "Marketing" tab** in dashboard
2. You should see:
   - Marketing campaigns section
   - Business listings section
   - "Unlimited listings" indicator

---

## Step 5.2: Create Marketing Listings (Test Unlimited)

**Goal:** Verify you can create more than 3 listings (free tier limit)

### Listing 1:
1. Click **"Create New Listing"**
2. Fill in details:
   - **Title:** `Premium Sale - 20% Off All Products`
   - **Description:** `Limited time offer for premium customers`
   - **Category:** `Promotion`
   - **Emoji:** 🎉
3. **Upload Before/After Images:**
   - Upload "before" image
   - Upload "after" image
4. Click **"Save as Draft"** or **"Publish"**

### Listing 2:
- **Title:** `New Product Launch - Premium Product 7`
- **Description:** `Introducing our latest premium offering`
- **Category:** `Product Launch`
- **Emoji:** 🚀

### Listing 3:
- **Title:** `Customer Testimonial - 5 Star Review`
- **Description:** `See what our customers are saying`
- **Category:** `Testimonial`
- **Emoji:** ⭐

### Listing 4: (Would fail on free tier)
- **Title:** `Weekend Special - Buy 2 Get 1 Free`
- **Description:** `Special weekend promotion`
- **Category:** `Promotion`
- **Emoji:** 🎁

### Listing 5:
- **Title:** `Behind the Scenes - Our Process`
- **Description:** `See how we create our products`
- **Category:** `Behind the Scenes`
- **Emoji:** 🎬

5. **Expected Result:**
   - ✅ All 5+ listings created successfully
   - ✅ No "limit reached" error
   - ✅ Counter shows "5 listings + Unlimited badge"
   - ✅ No day restrictions (can create on any day)

---

## Step 5.3: Test Day-Based Sharing (Premium = No Restrictions)

**Goal:** Verify premium users can share on ANY day (including Wed/Sat/Sun)

1. **Check current day:**
   - If it's Wednesday, Saturday, or Sunday → PERFECT for testing
   - If not, you can still test (no restrictions should show)

2. **Try to save/publish a listing:**
   - Click "Save as Draft" or "Publish"
   - Should work regardless of day

3. **Expected Result:**
   - ✅ No red warning banner about restricted days
   - ✅ Can save/publish on any day
   - ✅ No alerts about Wednesday/Saturday/Sunday restrictions

---

## Step 5.4: Create Marketing Campaign

1. **In Marketing tab, find "Campaigns" section**

2. **Click "Create Campaign"** (if available)

3. **Fill in campaign details:**
   - **Campaign Name:** `Premium Launch Campaign`
   - **Target Audience:** `All Customers`
   - **Start Date:** Today
   - **End Date:** 7 days from now
   - **Budget:** (if applicable)

4. **Add content:**
   - Select listings to include
   - Add promotional text
   - Set scheduling

5. **Save Campaign**

6. **Expected Result:**
   - ✅ Campaign created
   - ✅ Can schedule for any day
   - ✅ No restrictions

---

## Step 5.5: Share Listings

1. **Select a listing**

2. **Click "Share" button**

3. **Test sharing options:**
   - **Copy Link:** Copy direct link to listing
   - **WhatsApp:** (if integrated) Share to WhatsApp
   - **Facebook:** (if integrated) Share to Facebook
   - **Download Image:** Download listing as image

4. **Paste link in new tab:**
   - Verify listing displays correctly
   - Public view works

5. **Expected Result:**
   - ✅ Share links work
   - ✅ Public view displays
   - ✅ No day restrictions on sharing

---

# 🎯 PHASE 6: Premium Features Verification

## Step 6.1: Verify No Reset Timer

1. **Check dashboard header:**
   - No countdown timer visible
   - No "Days until reset" message
   - Premium badge visible

2. **Expected Result:**
   - ✅ No reset timer for premium users
   - ✅ Content is permanent

---

## Step 6.2: Verify Unlimited Badges

1. **Check each tab:**
   - **Gallery:** Shows "X images + Unlimited badge"
   - **Shop:** Shows "X products + Unlimited badge"
   - **Marketing:** Shows "X listings + Unlimited badge"

2. **Expected Result:**
   - ✅ Unlimited badges visible
   - ✅ No limit warnings

---

## Step 6.3: Test Public Profile View

1. **Open new incognito window**

2. **Navigate to your profile:**
   ```
   http://localhost:3000/business/premium-test-business
   ```

3. **Verify public view:**
   - Profile information displays
   - Gallery shows all images
   - Shop shows all products
   - "Add to Cart" buttons visible
   - Premium badge visible (if shown publicly)

4. **Expected Result:**
   - ✅ All content visible publicly
   - ✅ E-commerce functional
   - ✅ Professional appearance

---

# ✅ PHASE 7: Final Verification Checklist

## Database Verification

**Check Supabase Dashboard:**

- [ ] Profile exists with `subscription_tier = 'premium'`
- [ ] 5+ gallery images in `profile_gallery` table
- [ ] 7+ products in `profile_products` table
- [ ] 5+ listings in `profile_listings` table
- [ ] 1+ orders in `orders` table
- [ ] Order items in `order_items` table

---

## Feature Verification

### Gallery (Unlimited):
- [ ] Can upload more than 3 images
- [ ] No limit warnings
- [ ] "Unlimited" badge visible
- [ ] Gallery slider works

### Shop (Unlimited):
- [ ] Can add more than 5 products
- [ ] No limit warnings
- [ ] "Unlimited" badge visible
- [ ] Products display correctly

### E-Commerce:
- [ ] Cart button visible
- [ ] Add to cart works
- [ ] Cart drawer functions
- [ ] Checkout completes
- [ ] Orders created
- [ ] Orders viewable

### Marketing (Unlimited):
- [ ] Can create more than 3 listings
- [ ] No day restrictions (Wed/Sat/Sun work)
- [ ] No limit warnings
- [ ] "Unlimited" badge visible
- [ ] Share links work

### Premium Benefits:
- [ ] No reset timer
- [ ] No reset notifications
- [ ] Premium badge displays
- [ ] Can share any day
- [ ] Permanent content

---

# 🐛 Troubleshooting

## Issue: Premium badge not showing
**Solution:**
- Verify `subscription_tier = 'premium'` in database
- Refresh dashboard page
- Clear browser cache

## Issue: Still seeing limits
**Solution:**
- Check subscription tier in database
- Verify tier is exactly `'premium'` (not `'Premium'` or other)
- Restart app

## Issue: Cart button not visible
**Solution:**
- Verify CartProvider in `app/layout.tsx`
- Check CartButton in dashboard navigation
- Clear browser cache

## Issue: Can't add to cart
**Solution:**
- Verify product has price set
- Check you're viewing as customer (not owner)
- Check browser console for errors

## Issue: Orders not creating
**Solution:**
- Check Supabase connection
- Verify `orders` and `order_items` tables exist
- Check browser console for errors

## Issue: Day restrictions still showing
**Solution:**
- Verify subscription tier is premium
- Check `isRestrictedDay()` function in code
- Refresh page

---

# 📊 Test Results Template

## Test Summary

**Date:** ___________  
**Tester:** ___________  
**Environment:** Development / Staging / Production

### Phase 1: Registration & Profile
- [ ] Registration successful
- [ ] Profile setup complete
- [ ] Premium tier activated
- [ ] Premium badge visible

### Phase 2: Gallery (Unlimited)
- [ ] Uploaded 5+ images
- [ ] No limit errors
- [ ] Unlimited badge shows
- [ ] Gallery features work

### Phase 3: Products (Unlimited)
- [ ] Added 7+ products
- [ ] No limit errors
- [ ] Unlimited badge shows
- [ ] Product features work

### Phase 4: E-Commerce
- [ ] Cart functional
- [ ] Checkout works
- [ ] Orders created
- [ ] Orders viewable

### Phase 5: Marketing (Unlimited)
- [ ] Created 5+ listings
- [ ] No day restrictions
- [ ] Unlimited badge shows
- [ ] Sharing works

### Phase 6: Premium Features
- [ ] No reset timer
- [ ] Premium badges visible
- [ ] Public profile works
- [ ] All features functional

### Overall Result
- [ ] ✅ ALL TESTS PASSED
- [ ] ⚠️ SOME ISSUES FOUND (list below)
- [ ] ❌ MAJOR ISSUES (list below)

### Issues Found:
1. ___________
2. ___________
3. ___________

### Notes:
___________
___________
___________

---

# 🎉 Success Criteria

## Test is SUCCESSFUL if:

1. ✅ Can register and set up profile
2. ✅ Premium tier activates correctly
3. ✅ Can upload 5+ gallery images (no limits)
4. ✅ Can add 7+ products (no limits)
5. ✅ Can create 5+ listings (no limits)
6. ✅ No day restrictions on sharing
7. ✅ No reset timer visible
8. ✅ Cart and checkout work
9. ✅ Orders created successfully
10. ✅ All "Unlimited" badges visible
11. ✅ Premium badge displays
12. ✅ Public profile functional

---

**Estimated Total Test Time:** 30-45 minutes  
**Recommended:** Test in order, don't skip phases  
**Documentation:** `ECOMMERCE_QUICKSTART.md`, `WEEK7_COMPLETE_SUMMARY.md`

---

**Last Updated:** 2025-11-05  
**Status:** Ready for comprehensive premium tier testing! 🚀
