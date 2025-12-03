# Product Meta Tags - Testing Guide

## Local Development Testing

### 1. Inspect Meta Tags in Browser

#### Chrome DevTools
1. Open your product page: `http://localhost:3000/profile/[username]?product=[slug]`
2. Right-click → "Inspect" or press `F12`
3. Go to "Elements" tab
4. Look for `<head>` section
5. Find meta tags:
   - `<title>`
   - `<meta name="description">`
   - `<meta property="og:title">`
   - `<meta property="og:description">`
   - `<meta property="og:image">`
   - `<meta name="twitter:card">`
   - etc.

#### View Page Source
1. Right-click on page → "View Page Source"
2. Press `Ctrl+F` and search for:
   - `og:title`
   - `og:description`
   - `og:image`
   - `twitter:card`

### 2. Test with Online Tools

#### Facebook Open Graph Debugger
1. Go to: https://developers.facebook.com/tools/debug/og/object/
2. Enter your product URL: `https://www.a2zsellr.life/profile/[username]?product=[slug]`
3. Click "Scrape Again"
4. See the preview with:
   - Product image
   - Product name
   - Product description
   - URL

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Paste your product URL
3. See the Twitter card preview
4. Check that image, title, and description are correct

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Paste your product URL
3. See how it will appear when shared on LinkedIn

#### Telegram
1. Open Telegram
2. Paste product URL in a chat
3. See the preview

### 3. Manual Testing Steps

#### Step 1: Create a Test Product
```
1. Go to Dashboard
2. Click "Add to Shop"
3. Fill in:
   - Product Name: "Test Product"
   - Description: "This is a test product with a detailed description"
   - Price: 99.99
   - Category: "Products"
   - Upload an image
4. Click "Add Product"
```

#### Step 2: Get the Product URL
```
1. Go to your profile page
2. Find the product in the shop
3. Click on it to open the modal
4. Copy the URL from browser address bar
   Format: https://www.a2zsellr.life/profile/[username]?product=[slug]
```

#### Step 3: Test in Different Platforms

**WhatsApp:**
1. Open WhatsApp Web or Mobile
2. Open a chat
3. Paste the product URL
4. Wait for preview to load
5. Verify:
   - Image shows
   - Product name appears
   - Description shows
   - Link is correct

**Facebook:**
1. Go to Facebook.com
2. Create a new post
3. Paste the product URL
4. Wait for preview
5. Verify all details

**Twitter/X:**
1. Go to Twitter.com
2. Click "Compose"
3. Paste the product URL
4. See the card preview
5. Verify image and text

**LinkedIn:**
1. Go to LinkedIn.com
2. Click "Start a post"
3. Paste the product URL
4. See the preview
5. Verify details

### 4. Debugging

#### Check if Meta Tags are Generated

**In Browser Console:**
```javascript
// Get all meta tags
document.querySelectorAll('meta')

// Get specific meta tag
document.querySelector('meta[property="og:title"]')?.content

// Get all OG tags
Array.from(document.querySelectorAll('meta[property^="og:"]'))
  .map(m => `${m.getAttribute('property')}: ${m.getAttribute('content')}`)
```

#### Check Network Response

1. Open DevTools → Network tab
2. Reload page
3. Click on the document request (first one)
4. Go to "Response" tab
5. Search for `og:title`, `og:image`, etc.
6. Verify meta tags are in HTML

#### Check Next.js Build

```bash
# Build the project
npm run build

# Check build output for metadata generation
# Look for: "generateMetadata" in console output
```

### 5. Common Issues & Solutions

#### Issue: Meta tags not showing in browser
**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try incognito/private mode
4. Check that product URL has `?product=` parameter

#### Issue: Image not showing in preview
**Solution:**
1. Verify image URL is publicly accessible
2. Check image dimensions (recommended: 1200x630px)
3. Try different image format (JPG/PNG)
4. Check image file size (should be < 5MB)
5. Use Facebook Debugger to see error messages

#### Issue: Description shows HTML tags
**Solution:**
1. Check that `getProductMetaDescription()` is being called
2. Verify HTML stripping regex: `/<[^>]*>/g`
3. Check product description in database
4. Test with a simple text description first

#### Issue: Wrong product showing
**Solution:**
1. Verify product slug is correct
2. Check URL encoding: spaces should be `-`
3. Verify product name matches slug
4. Check that product is marked as `is_active: true`

### 6. Performance Testing

#### Check Meta Tag Generation Time
```bash
# Add timing to generateMetadata function
console.time('generateMetadata')
// ... function code ...
console.timeEnd('generateMetadata')
```

#### Monitor Database Queries
1. Check Supabase logs
2. Verify only 2 queries are made:
   - 1 for profile
   - 1 for product
3. Optimize if more queries are needed

### 7. Automated Testing

#### Jest Test Example
```typescript
import { getProductMetaDescription, getProductImageUrl } from '@/lib/productHelpers'

describe('Product Meta Tags', () => {
  it('should strip HTML from description', () => {
    const product = {
      description: '<p>Test <strong>product</strong></p>'
    }
    const result = getProductMetaDescription(product)
    expect(result).toBe('Test product')
    expect(result).not.toContain('<')
  })

  it('should truncate long descriptions', () => {
    const product = {
      description: 'a'.repeat(200)
    }
    const result = getProductMetaDescription(product)
    expect(result.length).toBeLessThanOrEqual(153) // 150 + "..."
  })

  it('should return default image if none provided', () => {
    const product = {
      image_url: null,
      images: null
    }
    const result = getProductImageUrl(product)
    expect(result).toBe('https://www.a2zsellr.life/default-product.png')
  })
})
```

### 8. Checklist for Testing

- [ ] Meta tags appear in page source
- [ ] Title format is correct: "Product Name – Available on A2Z Sellr"
- [ ] Description is clean (no HTML tags)
- [ ] Description is truncated to 150 chars if needed
- [ ] Image URL is correct and accessible
- [ ] og:type is "website"
- [ ] og:url is correct
- [ ] twitter:card is "summary_large_image"
- [ ] Facebook preview shows correctly
- [ ] Twitter preview shows correctly
- [ ] WhatsApp preview shows correctly
- [ ] LinkedIn preview shows correctly
- [ ] Profile page (no product) still works
- [ ] Fallback metadata works when product not found

### 9. Production Testing

#### Before Deploying
1. Test all examples from `PRODUCT_META_TAGS_EXAMPLES.md`
2. Verify with Facebook Debugger
3. Verify with Twitter Card Validator
4. Test sharing on actual social platforms
5. Monitor error logs for any issues

#### After Deploying
1. Test with real product URLs
2. Monitor social media shares
3. Check analytics for click-through rates
4. Gather user feedback
5. Monitor error logs

## Quick Test Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Check for TypeScript errors
npm run type-check
```

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/og/object/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
