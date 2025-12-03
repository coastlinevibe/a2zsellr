# Product Meta Tags - Integration Guide

## Overview
This guide explains how the product meta tags system integrates with the existing A2Z Sellr codebase.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Shares Product URL                  │
│         https://a2zsellr.life/profile/john?product=jacket   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js App Router (Server)                    │
│                                                             │
│  app/profile/[username]/layout.tsx                         │
│  ├─ generateMetadata() called                              │
│  ├─ Receives params: { username: "john" }                  │
│  └─ Receives searchParams: { product: "jacket" }           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Helper Functions (lib/productHelpers.ts)       │
│                                                             │
│  1. Fetch Profile from Supabase                            │
│     └─ SELECT id, display_name, bio, avatar_url           │
│                                                             │
│  2. Fetch Product from Supabase                            │
│     └─ SELECT * WHERE profile_id = ? AND is_active = true  │
│                                                             │
│  3. Extract Product Image                                  │
│     └─ getProductImageUrl(product)                         │
│                                                             │
│  4. Clean Description                                      │
│     └─ getProductMetaDescription(product)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Generate Meta Tags                             │
│                                                             │
│  ├─ og:title = "Product Name – Available on A2Z Sellr"    │
│  ├─ og:description = "First 150 chars of description"     │
│  ├─ og:image = "https://...product-image.jpg"             │
│  ├─ og:type = "website"                                    │
│  ├─ og:url = "https://a2zsellr.life/profile/john?..."     │
│  ├─ twitter:card = "summary_large_image"                  │
│  ├─ twitter:title = "Product Name – Available on A2Z..."  │
│  ├─ twitter:description = "First 150 chars..."            │
│  └─ twitter:image = "https://...product-image.jpg"        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Return Metadata Object                         │
│                                                             │
│  {                                                          │
│    title: "...",                                            │
│    description: "...",                                      │
│    openGraph: { ... },                                      │
│    twitter: { ... }                                         │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Renders HTML                           │
│                                                             │
│  <head>                                                     │
│    <title>Product Name – Available on A2Z Sellr</title>   │
│    <meta property="og:title" content="...">               │
│    <meta property="og:image" content="...">               │
│    ... (all meta tags)                                     │
│  </head>                                                    │
│  <body>                                                     │
│    ... (profile page content)                              │
│  </body>                                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Social Platform Crawls Page                    │
│                                                             │
│  Facebook, Twitter, WhatsApp, LinkedIn, etc.               │
│  ├─ Read meta tags from HTML                               │
│  ├─ Download product image                                 │
│  └─ Cache for preview                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Display Rich Preview                           │
│                                                             │
│  ┌─────────────────────────────────┐                       │
│  │  [Product Image]                │                       │
│  │                                 │                       │
│  │  Product Name – Available on    │                       │
│  │  A2Z Sellr                      │                       │
│  │                                 │                       │
│  │  Product description (150 chars)│                       │
│  │                                 │                       │
│  │  a2zsellr.life/profile/john/... │                       │
│  └─────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
app/
├── profile/
│   └── [username]/
│       ├── layout.tsx          ← NEW: Metadata generation
│       └── page.tsx            ← EXISTING: Profile page (client)
│
lib/
├── productHelpers.ts           ← NEW: Helper functions
├── supabaseClient.ts           ← EXISTING: Supabase client
└── ...

components/
├── ui/
│   ├── business-shop.tsx       ← EXISTING: Product form/display
│   └── ...
└── ...
```

## Data Flow

### 1. Product Creation
```
User creates product in business-shop.tsx
    ↓
Product saved to Supabase (profile_products table)
    ↓
Product has: name, description, images, price, category
```

### 2. Product Sharing
```
User shares product URL
    ↓
URL format: /profile/[username]?product=[slug]
    ↓
Social platform crawls the page
```

### 3. Metadata Generation
```
Next.js receives request for /profile/[username]?product=[slug]
    ↓
layout.tsx generateMetadata() is called
    ↓
Fetch profile by username from Supabase
    ↓
Fetch product by profile_id and slug from Supabase
    ↓
Extract image, description, name
    ↓
Generate meta tags
    ↓
Return metadata object
    ↓
Next.js renders HTML with meta tags
```

### 4. Social Preview
```
Social platform receives HTML
    ↓
Reads og:title, og:description, og:image
    ↓
Downloads image
    ↓
Caches preview
    ↓
Shows rich preview when shared
```

## Integration Points

### With Existing Components

#### 1. business-shop.tsx
- **Current:** Displays products in a grid
- **Integration:** Uses same product data structure
- **No changes needed:** Meta tags are generated server-side

#### 2. app/profile/[username]/page.tsx
- **Current:** Client component that displays profile and products
- **Integration:** Layout wraps this component
- **No changes needed:** Layout handles metadata generation

#### 3. supabaseClient.ts
- **Current:** Supabase client configuration
- **Integration:** productHelpers.ts uses this client
- **No changes needed:** Already configured

### Database Schema

The implementation uses existing Supabase tables:

#### profiles table
```sql
SELECT id, display_name, bio, business_category, business_location, avatar_url
FROM profiles
WHERE display_name ILIKE ? AND is_active = true
```

#### profile_products table
```sql
SELECT *
FROM profile_products
WHERE profile_id = ? AND is_active = true
ORDER BY created_at DESC
```

## How to Use

### For Developers

#### 1. Fetch a Product
```typescript
import { getProductByProfileAndSlug } from '@/lib/productHelpers'

const product = await getProductByProfileAndSlug(profileId, productSlug)
```

#### 2. Get Product Image
```typescript
import { getProductImageUrl } from '@/lib/productHelpers'

const imageUrl = getProductImageUrl(product)
```

#### 3. Get Meta Description
```typescript
import { getProductMetaDescription } from '@/lib/productHelpers'

const description = getProductMetaDescription(product)
```

### For Users

#### 1. Create a Product
1. Go to Dashboard
2. Click "Add to Shop"
3. Fill in product details
4. Upload product image
5. Click "Add Product"

#### 2. Share a Product
1. Go to your profile
2. Find the product
3. Click "Share" button
4. Copy the URL
5. Paste in WhatsApp, Facebook, etc.

#### 3. See the Preview
1. Paste product URL in chat
2. Wait for preview to load
3. See product image, name, and description

## Configuration

### Environment Variables
No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Configuration
No new tables or columns needed. Uses existing:
- `profiles` table
- `profile_products` table

### Next.js Configuration
No changes needed to `next.config.js`

## Performance Considerations

### Server-Side Generation
- ✅ Metadata generated at request time
- ✅ No client-side overhead
- ✅ Works with ISR (Incremental Static Regeneration)
- ✅ Cached by Next.js

### Database Queries
- ✅ Minimal queries (2 max)
- ✅ Uses indexed columns (profile_id, is_active)
- ✅ Efficient filtering

### Image Optimization
- ✅ Uses existing image URLs
- ✅ No image processing needed
- ✅ Social platforms handle caching

## Error Handling

### Missing Profile
```
If profile not found:
  → Falls back to default metadata
  → Logs error
  → Returns generic title/description
```

### Missing Product
```
If product not found:
  → Falls back to profile metadata
  → Logs error
  → Shows profile preview instead
```

### Missing Image
```
If product has no image:
  → Uses default product image
  → URL: https://www.a2zsellr.life/default-product.png
```

### Missing Description
```
If product has no description:
  → Uses fallback text
  → Text: "Discover this product on A2Z Sellr."
```

## Testing Integration

### 1. Unit Tests
```typescript
// Test helper functions
import { getProductMetaDescription } from '@/lib/productHelpers'

test('strips HTML from description', () => {
  const product = { description: '<p>Test</p>' }
  expect(getProductMetaDescription(product)).toBe('Test')
})
```

### 2. Integration Tests
```typescript
// Test metadata generation
import { generateMetadata } from '@/app/profile/[username]/layout'

test('generates product metadata', async () => {
  const metadata = await generateMetadata({
    params: { username: 'john' },
    searchParams: { product: 'jacket' }
  })
  expect(metadata.title).toContain('jacket')
})
```

### 3. E2E Tests
```typescript
// Test full flow
test('product URL shows correct preview', async () => {
  await page.goto('/profile/john?product=jacket')
  const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content')
  expect(ogTitle).toContain('jacket')
})
```

## Monitoring

### Logs to Check
```
// In server logs, look for:
"Error fetching profile for metadata:"
"Error fetching product for metadata:"
```

### Metrics to Track
- Product share count
- Click-through rate from social media
- Most shared products
- Broken image URLs

### Analytics Integration
```typescript
// Future: Add analytics tracking
trackProductShare(productId, platform)
trackProductClick(productId, source)
```

## Troubleshooting

### Meta tags not appearing
1. Check browser cache
2. Verify product URL has `?product=` parameter
3. Check Supabase connection
4. Check server logs for errors

### Image not loading
1. Verify image URL is public
2. Check image dimensions
3. Test with Facebook OG Debugger
4. Check Supabase storage permissions

### Wrong metadata showing
1. Verify product slug is correct
2. Check URL encoding
3. Verify product is active
4. Clear social platform cache

## Future Enhancements

### Phase 2: Schema.org
```typescript
// Add JSON-LD structured data
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Name",
  "description": "...",
  "image": "...",
  "price": "99.99",
  "priceCurrency": "ZAR"
}
</script>
```

### Phase 3: Analytics
```typescript
// Track product shares and clicks
trackProductShare(productId, platform)
trackProductClick(productId, source)
```

### Phase 4: Sitemap
```typescript
// Auto-generate sitemap for all products
// Improves SEO
```

## Support & Documentation

- **Quick Start:** `PRODUCT_META_TAGS_QUICK_START.md`
- **Full Docs:** `PRODUCT_META_TAGS_IMPLEMENTATION.md`
- **Examples:** `PRODUCT_META_TAGS_EXAMPLES.md`
- **Testing:** `PRODUCT_META_TAGS_TESTING.md`
- **Summary:** `PRODUCT_META_TAGS_SUMMARY.md`

## Checklist for Deployment

- [ ] All files created and no TypeScript errors
- [ ] Tested with real product URLs
- [ ] Verified with Facebook OG Debugger
- [ ] Verified with Twitter Card Validator
- [ ] Tested sharing on WhatsApp
- [ ] Tested sharing on Facebook
- [ ] Tested sharing on Twitter
- [ ] Tested sharing on LinkedIn
- [ ] Verified fallback metadata works
- [ ] Checked error logs
- [ ] Documented for team
- [ ] Ready for production deployment
