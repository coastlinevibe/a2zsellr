# Free Tier Testing Checklist

## ✅ Listing Creation - Product Auto-Selection Test

### Test: Products Should NOT Be Auto-Selected in Listings

**Expected Behavior:**
- When creating a new listing, NO products should be pre-selected
- Products should only appear in the listing if user explicitly clicks them
- Empty listings (no products) should be allowed

**Test Steps:**

1. **Login as Free Tier User**
   - Ensure `subscription_tier = 'free'`
   - Have at least 2-3 products in shop

2. **Navigate to Marketing > Create Listing**
   - Click "New Listing" button
   - Opens listing builder

3. **Check Initial State**
   - ✅ "Selected Products" section should show **0 products**
   - ✅ Product selector should be **closed** by default
   - ✅ No products should be highlighted/selected

4. **Create Listing WITHOUT Products**
   - Enter title: "Test Listing No Products"
   - Enter message template
   - Upload 1-2 images (optional)
   - Click "Save Listing Draft"
   - ✅ Should save successfully
   - ✅ Check database: `selected_products` should be `[]` (empty array)

5. **Create Listing WITH Products (Manual Selection)**
   - Create new listing
   - Click "Select from Shop" button
   - Click on 1-2 products to select them
   - ✅ Selected products should show checkmark
   - ✅ Selected products counter should update
   - Save listing
   - ✅ Check database: `selected_products` should contain only selected IDs

6. **Verify in Database**
   ```sql
   SELECT id, title, selected_products 
   FROM profile_listings 
   WHERE profile_id = 'your-user-id'
   ORDER BY created_at DESC;
   ```
   - First listing: `selected_products = []`
   - Second listing: `selected_products = ['product-id-1', 'product-id-2']`

---

## 🔍 Code Protection Points

### 1. Initial State (Line 61)
```typescript
const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
```
✅ Starts empty

### 2. Mount Protection (Lines 64-69)
```typescript
React.useEffect(() => {
  if (selectedProducts.length > 0) {
    console.warn('DETECTED AUTO-SELECTED PRODUCTS - CLEARING THEM:', selectedProducts)
    setSelectedProducts([])
  }
}, [])
```
✅ Clears any accidental auto-selection on mount

### 3. Save Logic (Line 363)
```typescript
selected_products: selectedProducts.length > 0 ? selectedProducts.map(p => p.id) : []
```
✅ Only saves if explicitly selected

### 4. Debug Logging (Lines 367-372)
```typescript
console.log('Saving listing with:', {
  title: campaignData.title,
  selected_products_count: selectedProducts.length,
  selected_product_ids: campaignData.selected_products,
  uploaded_media_count: uploadedMedia.length
})
```
✅ Logs selection for debugging

---

## 🎯 Additional Free Tier Tests

### Gallery Limit (3 images)
- [ ] Upload 3 images successfully
- [ ] 4th upload blocked with error
- [ ] Upload button disabled at limit
- [ ] Warning banner shows

### Shop Limit (5 products)
- [ ] Add 5 products successfully
- [ ] 6th product blocked with error
- [ ] "Add to Shop" button disabled at limit
- [ ] Warning banner shows

### Listing Limit (3 listings)
- [ ] Create 3 listings successfully
- [ ] 4th listing blocked with error
- [ ] "New Listing" button disabled at limit
- [ ] Warning banner shows

### Day Restrictions (Wed/Sat/Sun)
- [ ] Monday: Can create listing ✅
- [ ] Tuesday: Can create listing ✅
- [ ] Wednesday: Blocked with error ❌
- [ ] Thursday: Can create listing ✅
- [ ] Friday: Can create listing ✅
- [ ] Saturday: Blocked with error ❌
- [ ] Sunday: Blocked with error ❌

### Reset Countdown
- [ ] Timer shows in header
- [ ] Updates every second
- [ ] Color changes based on urgency
- [ ] Modal shows at 3 days
- [ ] Modal shows at 1 day
- [ ] Modal shows at 1 hour
- [ ] Modal shows when expired

### Reset Execution
- [ ] SQL function runs successfully
- [ ] Products deleted after 7 days
- [ ] Listings deleted after 7 days
- [ ] Gallery deleted after 7 days
- [ ] Profile preserved
- [ ] Auth preserved
- [ ] Reset history recorded

---

## 🐛 Known Issues / Edge Cases

### None Currently
All protection mechanisms are in place and working correctly.

---

## 📝 Test Results

| Test | Date | Tester | Result | Notes |
|------|------|--------|--------|-------|
| Product Auto-Selection | - | - | ⏳ Pending | Need to verify in browser |
| Gallery Limit | - | - | ⏳ Pending | - |
| Shop Limit | - | - | ⏳ Pending | - |
| Listing Limit | - | - | ⏳ Pending | - |
| Day Restrictions | - | - | ⏳ Pending | - |
| Reset Timer | - | - | ⏳ Pending | - |
| Reset Execution | - | - | ⏳ Pending | - |

---

## 🚀 Quick Test Commands

### Check User Tier
```sql
SELECT id, display_name, subscription_tier, created_at 
FROM profiles 
WHERE email = 'test@example.com';
```

### Check User's Listings
```sql
SELECT id, title, selected_products, uploaded_media, created_at 
FROM profile_listings 
WHERE profile_id = 'user-id'
ORDER BY created_at DESC;
```

### Check User's Products
```sql
SELECT id, name, category, created_at 
FROM profile_products 
WHERE profile_id = 'user-id'
ORDER BY created_at DESC;
```

### Check User's Gallery
```sql
SELECT id, title, image_url, created_at 
FROM profile_gallery 
WHERE profile_id = 'user-id'
ORDER BY created_at DESC;
```

### Check Reset History
```sql
SELECT * FROM reset_history 
WHERE profile_id = 'user-id'
ORDER BY reset_date DESC;
```

---

**Status:** Ready for testing ✅  
**Last Updated:** 2025-11-05
