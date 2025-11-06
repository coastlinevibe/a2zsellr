# A2Z Business Directory - Premium Features Testing Guide

## 🎯 Overview

This comprehensive testing guide covers all Free and Premium tier features to ensure everything works correctly before moving to Business tier development.

## 🆓 **FREE TIER TESTING CHECKLIST**

### ✅ **1. User Profile System**
- [ ] **Profile Creation**
  - Create new user account
  - Fill in all profile fields (name, bio, phone, email, website)
  - Verify profile completeness indicator updates
  - Test field validation and error messages

- [ ] **Profile Gallery (3 Image Limit)**
  - Upload 3 images successfully
  - Try uploading 4th image - should be blocked
  - Verify gallery displays correctly
  - Test image deletion

- [ ] **Contact Information**
  - Add phone, email, website, address
  - Verify contact form works
  - Test "Contact Business" buttons

### ✅ **2. Product Shop System (Display Only)**
- [ ] **Product Management (5 Product Limit)**
  - Add 5 products with 1 image each
  - Try adding 6th product - should be blocked
  - Verify products display in grid
  - Test product detail modal (view only)

- [ ] **Product Restrictions**
  - Verify "Contact for pricing" buttons (no cart functionality)
  - Confirm no purchase options available
  - Test product editing and deletion

### ✅ **3. Location System**
- [ ] **Text-Only Location**
  - Select location from dropdown (13 SA cities)
  - Verify location displays as text only
  - Confirm no Google Maps integration

### ✅ **4. Shared Listings (3 Listing Limit)**
- [ ] **Listing Creation**
  - Create 3 shared listings
  - Try creating 4th listing - should be blocked
  - Test different gallery layouts (mosaic, horizontal, vertical, hover)

- [ ] **Day-Based Sharing Restrictions**
  - Test sharing on Monday-Tuesday, Thursday-Friday (allowed)
  - Try sharing on Wednesday, Saturday, Sunday (should be blocked)
  - Verify "Sharing unavailable today" message

### ✅ **5. 7-Day Reset System**
- [ ] **Reset Countdown**
  - Verify countdown timer displays correctly
  - Check reset warnings (3 days, 1 day, 1 hour before)
  - Test manual reset option

- [ ] **Reset Functionality**
  - Wait for or trigger 7-day reset
  - Verify products and listings are cleared
  - Confirm profile data remains intact

---

## 💎 **PREMIUM TIER TESTING CHECKLIST**

### ✅ **1. Restriction Removal**
- [ ] **No 7-Day Reset**
  - Upgrade to Premium
  - Verify reset timer disappears
  - Confirm content remains after 7 days

- [ ] **No Sharing Restrictions**
  - Test sharing on Wednesday, Saturday, Sunday
  - Verify all days are available for sharing
  - Check "Share any day" functionality

- [ ] **Unlimited Limits**
  - Upload more than 3 gallery images
  - Add more than 5 products
  - Create more than 3 listings
  - Verify all limits are removed

### ✅ **2. Enhanced Gallery System**
- [ ] **Gallery Slider Component**
  - Test carousel navigation (arrows, dots)
  - Verify auto-play functionality
  - Test thumbnail navigation
  - Check responsive design

- [ ] **Full-Screen Image Viewer**
  - Click images to open fullscreen
  - Test zoom in/out functionality
  - Try image rotation
  - Test download and share options
  - Verify keyboard navigation (arrows, escape)

### ✅ **3. E-Commerce Integration**
- [ ] **Shopping Cart**
  - Add products to cart from different businesses
  - Test quantity adjustments
  - Verify cart persistence across sessions
  - Check cart grouping by business

- [ ] **Checkout Process**
  - Fill in customer information
  - Add shipping address
  - Select payment method (PayFast/EFT)
  - Complete order placement
  - Verify order confirmation

- [ ] **Order Management**
  - View orders in `/orders` page
  - Check order status tracking
  - Test order details display
  - Verify multi-business order support

### ✅ **4. PayFast Payment System**
- [ ] **Subscription Upgrades**
  - Test Premium upgrade (R149)
  - Test Business upgrade (R299)
  - Verify PayFast integration
  - Test EFT payment option with proof upload

- [ ] **Payment Processing**
  - Complete PayFast payment flow
  - Test payment success/cancel pages
  - Verify automatic subscription activation
  - Check admin payment approval for EFT

### ✅ **5. Campaign Management System**
- [ ] **Group Management**
  - Add WhatsApp groups manually
  - Add Facebook groups manually
  - Test group editing and deletion
  - Verify active/inactive status toggle

- [ ] **Campaign Creation**
  - Create new marketing campaign
  - Add message content and images
  - Select target groups
  - Set daily limits (50 groups, 10 members)
  - Schedule weekly campaigns

- [ ] **n8n Integration**
  - Test webhook endpoints
  - Verify campaign data retrieval
  - Check daily limit enforcement
  - Test execution logging

### ✅ **6. Enhanced Listing Features**
- [ ] **Video Support**
  - Upload video files to listings
  - Verify video thumbnail generation
  - Test video playback in listings
  - Check video in fullscreen viewer

- [ ] **Multiple Images**
  - Add multiple images to single listing
  - Test image reordering
  - Verify gallery slider in listings
  - Check image optimization

### ✅ **7. Advanced Sharing Options**
- [ ] **Multi-Platform Sharing**
  - Share to WhatsApp, Facebook, Instagram, Twitter, LinkedIn
  - Test platform-specific formatting
  - Verify QR code generation
  - Check custom message functionality

- [ ] **Sharing Scheduler**
  - Schedule posts for future dates
  - Test weekly repeat functionality
  - Verify scheduled post tracking
  - Check sharing analytics

### ✅ **8. Marketing Analytics**
- [ ] **Performance Dashboard**
  - View total views, engagement, shares
  - Check platform-specific metrics
  - Test date range filtering
  - Verify growth rate calculations

- [ ] **Campaign Analytics**
  - Track campaign performance
  - View conversion rates
  - Check demographic data
  - Test export functionality

### ✅ **9. Google Maps Integration** (If API key configured)
- [ ] **Interactive Maps**
  - Test map picker component
  - Verify location pin placement
  - Check "Get Directions" functionality
  - Test address autocomplete

---

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: Free User Journey**
1. Create new account
2. Complete profile with 3 images
3. Add 5 products (display only)
4. Create 3 shared listings
5. Try sharing on restricted days
6. Wait for or trigger 7-day reset
7. Verify content is cleared

### **Scenario 2: Premium Upgrade Journey**
1. Start as free user with content
2. Upgrade to Premium (R149)
3. Verify all restrictions removed
4. Add unlimited content
5. Test e-commerce functionality
6. Create and run campaigns
7. View marketing analytics

### **Scenario 3: E-Commerce Flow**
1. Browse products as customer
2. Add items from multiple businesses to cart
3. Complete checkout process
4. Place orders (one per business)
5. Track order status
6. Verify business receives orders

### **Scenario 4: Campaign Management Flow**
1. Add WhatsApp and Facebook groups
2. Create marketing campaign
3. Schedule weekly posts
4. Monitor execution via n8n
5. View campaign analytics
6. Adjust targeting based on performance

### **Scenario 5: Content Creation Flow**
1. Create enhanced listing with videos
2. Use gallery slider for multiple images
3. Share across all platforms
4. Schedule future shares
5. Track performance analytics
6. Export reports

---

## 🐛 **COMMON ISSUES TO TEST**

### **Free Tier Issues**
- [ ] Limit enforcement bypassing
- [ ] Reset system not triggering
- [ ] Sharing restrictions not working
- [ ] Profile completeness calculation errors

### **Premium Tier Issues**
- [ ] Payment processing failures
- [ ] Cart persistence issues
- [ ] Gallery slider performance
- [ ] Fullscreen viewer bugs
- [ ] Campaign scheduling errors
- [ ] Analytics data accuracy

### **Cross-Tier Issues**
- [ ] Upgrade/downgrade transitions
- [ ] Data migration between tiers
- [ ] Permission changes
- [ ] UI state consistency

---

## 📊 **PERFORMANCE TESTING**

### **Load Testing**
- [ ] Upload multiple large images
- [ ] Test with 100+ products
- [ ] Stress test gallery slider
- [ ] Campaign with 50 groups

### **Mobile Testing**
- [ ] Responsive design on all screens
- [ ] Touch interactions
- [ ] Mobile sharing functionality
- [ ] Performance on slow networks

### **Browser Testing**
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Different screen resolutions
- [ ] Incognito/private mode
- [ ] Local storage functionality

---

## ✅ **TESTING COMPLETION CHECKLIST**

### **Before Business Tier Development**
- [ ] All Free tier features tested and working
- [ ] All Premium tier features tested and working
- [ ] Payment system fully functional
- [ ] E-commerce flow complete
- [ ] Campaign management operational
- [ ] Analytics dashboard accurate
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Security measures in place

### **Documentation Updated**
- [ ] User guides created
- [ ] API documentation complete
- [ ] Admin guides written
- [ ] Troubleshooting guides ready

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. **Fix any identified bugs**
2. **Optimize performance issues**
3. **Update documentation**
4. **Prepare for Business tier development**
5. **Plan user onboarding flows**
6. **Set up monitoring and analytics**

---

**🎯 Goal: Ensure 100% functionality of Free and Premium tiers before proceeding to Business tier advanced features.**
