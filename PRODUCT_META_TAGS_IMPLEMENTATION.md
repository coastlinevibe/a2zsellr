# Product Dynamic Meta Tags Implementation

## Overview
This document describes the implementation of dynamic Open Graph and Twitter meta tags for product pages on A2Z Sellr.

## Architecture

### Files Created/Modified

#### 1. `lib/productHelpers.ts` (NEW)
Helper functions for product data fetching and formatting:

- **`getProductById(productId)`** - Fetch a product by its ID
- **`getProductByProfileAndSlug(profileId, productSlug)`** - Fetch a product by profile ID and product slug
- **`getProductImageUrl(product)`** - Get the first image URL from a product (handles both JSON array and single image formats)
- **`getProductMetaDescription(product)`** - Get clean description for meta tags (strips HTML, limits to 150 chars)
- **`formatProductPrice(priceCents)`** - Format product price for display

#### 2. `app/profile/[username]/layout.tsx` (NEW)
Server component that generates dynamic metadata for product pages:

- Implements `generateMetadata()` function that runs at build time and request time
- Detects if a product query parameter is present
- Fetches product data from Supabase
- Generates appropriate Open Graph and Twitter meta tags
- Falls back to profile metadata if no product is specified

### How It Works

#### Product URL Structure
Products are accessed via query parameters on the profile page:
```
https://www.a2zsellr.life/profile/[username]?product=[product-slug]
```

#### Metadata Generation Flow
1. User visits a product URL with `?product=` query parameter
2. Next.js calls `generateMetadata()` in the layout
3. Layout fetches the profile by username
4. If product slug exists, layout fetches the product data
5. Product image, name, and description are extracted
6. Dynamic meta tags are generated and returned

#### Meta Tags Generated

**For Product Pages:**
```
<title>Product Name – Available on A2Z Sellr</title>
<meta name="description" content="Product description (max 150 chars)">
<meta property="og:title" content="Product Name – Available on A2Z Sellr">
<meta property="og:description" content="Product description (max 150 chars)">
<meta property="og:image" content="https://...product-image.jpg">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.a2zsellr.life/profile/[username]?product=[slug]">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Product Name – Available on A2Z Sellr">
<meta name="twitter:description" content="Product description (max 150 chars)">
<meta name="twitter:image" content="https://...product-image.jpg">
```

**For Profile Pages (no product):**
```
<title>Business Name | A2Z Sellr</title>
<meta name="description" content="Business bio or category info">
<meta property="og:title" content="Business Name | A2Z Sellr">
<meta property="og:description" content="Business bio or category info">
<meta property="og:image" content="https://...avatar.jpg">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.a2zsellr.life/profile/[username]">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Business Name | A2Z Sellr">
<meta name="twitter:description" content="Business bio or category info">
<meta name="twitter:image" content="https://...avatar.jpg">
```

## Features

### Image Handling
- Supports both JSON array format (`product.images`) and single image format (`product.image_url`)
- Automatically extracts first image from array
- Falls back to default product image if none available

### Description Processing
- Strips HTML tags from rich text descriptions
- Limits description to 150 characters for meta tags
- Adds ellipsis if truncated
- Provides fallback text if description is empty

### Error Handling
- Gracefully handles missing profiles or products
- Falls back to default metadata if data fetch fails
- Logs errors for debugging

## Usage

### Sharing a Product
When a user shares a product URL:
```
https://www.a2zsellr.life/profile/john-doe?product=premium-leather-jacket
```

The shared preview will show:
- **Title:** "Premium Leather Jacket – Available on A2Z Sellr"
- **Description:** First 150 characters of the product description
- **Image:** First product image
- **URL:** The full product URL

### Supported Platforms
Meta tags work with:
- WhatsApp
- Facebook
- Twitter/X
- LinkedIn
- Telegram
- Discord
- And any other platform that reads Open Graph tags

## Testing

### Manual Testing
1. Create a product with:
   - Name: "Test Product"
   - Description: "This is a test product with a long description that should be truncated"
   - Image: Upload an image
2. Share the product URL: `https://www.a2zsellr.life/profile/[username]?product=test-product`
3. Paste in WhatsApp, Facebook, or Twitter to see the preview

### Automated Testing
Use Open Graph debuggers:
- Facebook: https://developers.facebook.com/tools/debug/og/object/
- Twitter: https://cards-dev.twitter.com/validator

## Future Enhancements

1. **Structured Data (Schema.org)**
   - Add JSON-LD for Product schema
   - Enables rich snippets in search results

2. **Dynamic Pricing**
   - Include price in meta description
   - Show discount information

3. **Product Variants**
   - Support multiple product images in carousel
   - Show variant options in preview

4. **Analytics Integration**
   - Track which products are shared most
   - Monitor click-through rates from social platforms

## Troubleshooting

### Meta tags not updating
- Clear browser cache
- Use incognito/private mode
- Wait for Next.js to rebuild (if using ISR)

### Image not showing in preview
- Verify image URL is publicly accessible
- Check image dimensions (recommended: 1200x630px)
- Ensure image is in supported format (JPG, PNG, WebP)

### Description showing HTML tags
- Ensure product description is properly formatted in RichTextEditor
- Check that `getProductMetaDescription()` is stripping tags correctly

## Related Files
- `components/ui/business-shop.tsx` - Product form and display
- `app/profile/[username]/page.tsx` - Profile page (client component)
- `lib/supabaseClient.ts` - Supabase client configuration
