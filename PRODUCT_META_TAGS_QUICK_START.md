# Product Meta Tags - Quick Start Guide

## What Was Implemented

Dynamic Open Graph and Twitter meta tags for product pages. When someone shares a product URL on social media, it now shows:
- ✅ Product name as title
- ✅ Product description (first 150 chars, HTML stripped)
- ✅ Product image as thumbnail
- ✅ Proper URL

## How It Works

### Product URL Format
```
https://www.a2zsellr.life/profile/[business-name]?product=[product-slug]
```

Example:
```
https://www.a2zsellr.life/profile/john-doe?product=premium-leather-jacket
```

### What Happens When Shared
1. User shares product URL on WhatsApp, Facebook, Twitter, etc.
2. Social platform fetches the page
3. Next.js server generates dynamic meta tags
4. Social platform displays:
   - Product image
   - Product name
   - Product description
   - Link to product

## Files Created

### 1. `lib/productHelpers.ts`
Helper functions for:
- Fetching products from Supabase
- Extracting product images
- Cleaning descriptions for meta tags
- Formatting prices

**Key Functions:**
```typescript
getProductByProfileAndSlug(profileId, productSlug)  // Fetch product
getProductImageUrl(product)                          // Get first image
getProductMetaDescription(product)                   // Clean description
```

### 2. `app/profile/[username]/layout.tsx`
Server component that:
- Detects product query parameter
- Fetches product data
- Generates dynamic meta tags
- Falls back to profile metadata if no product

## Testing

### Manual Test
1. Create a product with name, description, and image
2. Share the product URL on WhatsApp or Facebook
3. See the preview with product image, name, and description

### Automated Test
Use Facebook's OG debugger:
https://developers.facebook.com/tools/debug/og/object/

Paste your product URL and click "Scrape Again"

## Features

✅ **Image Handling**
- Supports multiple images (uses first one)
- Falls back to default if no image
- Recommended size: 1200x630px

✅ **Description Processing**
- Strips HTML tags from rich text
- Limits to 150 characters
- Adds "..." if truncated
- Fallback text if empty

✅ **Error Handling**
- Gracefully handles missing data
- Falls back to profile metadata
- Logs errors for debugging

## Common Issues & Solutions

### Meta tags not showing
**Problem:** Shared preview is blank or generic
**Solution:** 
- Clear browser cache
- Use incognito mode
- Wait for Next.js rebuild
- Check product has image and description

### Image not showing
**Problem:** Preview shows no image
**Solution:**
- Verify image URL is public
- Check image dimensions (1200x630px recommended)
- Try different image format (JPG/PNG)

### Description shows HTML
**Problem:** Meta description contains `<span>`, `<b>`, etc.
**Solution:**
- This is handled automatically by `getProductMetaDescription()`
- Check that product description is properly saved

## How to Use in Code

### Fetch a Product
```typescript
import { getProductByProfileAndSlug } from '@/lib/productHelpers'

const product = await getProductByProfileAndSlug(profileId, productSlug)
```

### Get Product Image
```typescript
import { getProductImageUrl } from '@/lib/productHelpers'

const imageUrl = getProductImageUrl(product)
```

### Get Meta Description
```typescript
import { getProductMetaDescription } from '@/lib/productHelpers'

const description = getProductMetaDescription(product)
```

## Next Steps

1. **Test with real products** - Share a product URL and verify preview
2. **Monitor analytics** - Track which products get shared most
3. **Optimize images** - Ensure all products have good quality images
4. **Add schema.org** - Future enhancement for search results

## Support

For issues or questions:
1. Check the full documentation: `PRODUCT_META_TAGS_IMPLEMENTATION.md`
2. Review the code in `app/profile/[username]/layout.tsx`
3. Check helper functions in `lib/productHelpers.ts`
