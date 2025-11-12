# HOTFIX: Listing Media Limits Display
*Fixed on November 12, 2025*

## 🐛 **Issue Found**
User reported that the "Listing Builder" was showing "0/5 items" for listing media, but the actual limits should be tier-based:
- Free: 3 items
- Premium: 8 items  
- Business: 999 items

## 🔧 **Root Cause**
Multiple hardcoded values in `components/ui/wysiwyg-campaign-builder.tsx` were using a fixed limit of 5 instead of tier-based limits:

1. **Line 886**: Media count display
2. **Line 971**: "Select from Shop" button disable condition  
3. **Line 979**: "Upload Media" button disable condition
4. **Line 1021**: Product selection limit check

## ✅ **Fix Applied**

### **File Modified:** `components/ui/wysiwyg-campaign-builder.tsx`

#### **Change 1: Added Tier-Based Limits**
```typescript
// BEFORE
const LISTING_MEDIA_LIMIT = 5
const userTier = businessProfile?.subscription_tier || 'free'

// AFTER
const userTier = businessProfile?.subscription_tier || 'free'

// Tier-based listing media limits
const tierMediaLimits = {
  free: 3,
  premium: 8,
  business: 999
}
const LISTING_MEDIA_LIMIT = tierMediaLimits[userTier as keyof typeof tierMediaLimits] || 3
```

#### **Change 2: Media Count Display**
```typescript
// BEFORE
{uploadedMedia.length + selectedProducts.length}/5 items

// AFTER
{uploadedMedia.length + selectedProducts.length}/{userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999} items
```

#### **Change 3: Button Disable Conditions**
```typescript
// BEFORE
disabled={(uploadedMedia.length + selectedProducts.length) >= 5}

// AFTER
disabled={(uploadedMedia.length + selectedProducts.length) >= (userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999)}
```

#### **Change 4: Product Selection Limit**
```typescript
// BEFORE
const LISTING_MEDIA_LIMIT = 5

// AFTER
const LISTING_MEDIA_LIMIT = userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999
```

## 🎯 **Result**
- ✅ Free tier users see "0/3 items"
- ✅ Premium tier users see "0/8 items" 
- ✅ Business tier users see "0/999 items"
- ✅ Upload buttons disable at correct limits
- ✅ Error messages show correct tier-specific limits
- ✅ Consistent with all other premium tier limits

## 🧪 **Testing**
The fix ensures that:
1. Display shows correct limit for each tier
2. Upload functionality respects tier-specific limits
3. Error messages show accurate limits
4. Button states update correctly based on tier

**Status: ✅ FIXED - Listing media now displays correct tier-based limits**
