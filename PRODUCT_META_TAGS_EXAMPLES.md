# Product Meta Tags - Examples

## Example 1: Premium Leather Jacket

### Product Data
```json
{
  "id": "prod-123",
  "name": "Premium Leather Jacket",
  "description": "<p style=\"color: rgb(231, 76, 60);\">High-quality genuine leather jacket with premium stitching and comfortable fit. Perfect for any occasion.</p>",
  "price_cents": 299900,
  "discounted_price": "249900",
  "category": "Fashion",
  "image_url": "https://storage.supabase.co/product-images/jacket.jpg",
  "images": [
    {
      "url": "https://storage.supabase.co/product-images/jacket-1.jpg",
      "order": 0
    },
    {
      "url": "https://storage.supabase.co/product-images/jacket-2.jpg",
      "order": 1
    }
  ]
}
```

### Generated Meta Tags
```html
<title>Premium Leather Jacket – Available on A2Z Sellr</title>
<meta name="description" content="High-quality genuine leather jacket with premium stitching and comfortable fit. Perfect for any occasion.">

<!-- Open Graph Tags -->
<meta property="og:title" content="Premium Leather Jacket – Available on A2Z Sellr">
<meta property="og:description" content="High-quality genuine leather jacket with premium stitching and comfortable fit. Perfect for any occasion.">
<meta property="og:image" content="https://storage.supabase.co/product-images/jacket-1.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Premium Leather Jacket – Available on A2Z Sellr">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.a2zsellr.life/profile/john-doe?product=premium-leather-jacket">
<meta property="og:site_name" content="A2Z Sellr">

<!-- Twitter Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Premium Leather Jacket – Available on A2Z Sellr">
<meta name="twitter:description" content="High-quality genuine leather jacket with premium stitching and comfortable fit. Perfect for any occasion.">
<meta name="twitter:image" content="https://storage.supabase.co/product-images/jacket-1.jpg">
```

### Social Media Preview

**WhatsApp/Facebook:**
```
┌─────────────────────────────────┐
│  [Jacket Image]                 │
│                                 │
│  Premium Leather Jacket –       │
│  Available on A2Z Sellr         │
│                                 │
│  High-quality genuine leather   │
│  jacket with premium stitching  │
│  and comfortable fit. Perfect   │
│  for any occasion.              │
│                                 │
│  www.a2zsellr.life/profile/...  │
└─────────────────────────────────┘
```

---

## Example 2: Long Description (Truncated)

### Product Data
```json
{
  "id": "prod-456",
  "name": "Professional Camera",
  "description": "This is a professional-grade DSLR camera with advanced features including 4K video recording, 45MP sensor, weather-sealed body, dual SD card slots, and professional autofocus system. Perfect for photographers and videographers who demand the best quality.",
  "price_cents": 599900,
  "category": "Electronics",
  "image_url": "https://storage.supabase.co/product-images/camera.jpg"
}
```

### Generated Meta Tags
```html
<title>Professional Camera – Available on A2Z Sellr</title>
<meta name="description" content="This is a professional-grade DSLR camera with advanced features including 4K video recording, 45MP sensor, weather-sealed body, dual SD card slots, and professional autofocus system. Perfect for photographers and videographers who demand the best quality.">

<!-- Note: Description is 150 chars max, so it gets truncated -->
<meta property="og:description" content="This is a professional-grade DSLR camera with advanced features including 4K video recording, 45MP sensor, weather-sealed body, dual SD card slots, and professional autofocus system. Perfect for photographers and videographers who demand the best quality.">
```

**Note:** If description exceeds 150 characters, it's truncated with "..."

---

## Example 3: No Description (Fallback)

### Product Data
```json
{
  "id": "prod-789",
  "name": "Wireless Headphones",
  "description": null,
  "price_cents": 89900,
  "category": "Audio",
  "image_url": "https://storage.supabase.co/product-images/headphones.jpg"
}
```

### Generated Meta Tags
```html
<title>Wireless Headphones – Available on A2Z Sellr</title>
<meta name="description" content="Discover this product on A2Z Sellr.">

<meta property="og:title" content="Wireless Headphones – Available on A2Z Sellr">
<meta property="og:description" content="Discover this product on A2Z Sellr.">
<meta property="og:image" content="https://storage.supabase.co/product-images/headphones.jpg">
```

---

## Example 4: No Image (Fallback)

### Product Data
```json
{
  "id": "prod-101",
  "name": "Service Package",
  "description": "Professional consulting services for business growth",
  "price_cents": null,
  "category": "Services",
  "image_url": null,
  "images": null
}
```

### Generated Meta Tags
```html
<title>Service Package – Available on A2Z Sellr</title>
<meta name="description" content="Professional consulting services for business growth">

<meta property="og:title" content="Service Package – Available on A2Z Sellr">
<meta property="og:description" content="Professional consulting services for business growth">
<meta property="og:image" content="https://www.a2zsellr.life/default-product.png">
<!-- Falls back to default product image -->
```

---

## Example 5: HTML in Description (Stripped)

### Product Data
```json
{
  "id": "prod-202",
  "name": "Luxury Watch",
  "description": "<p>Premium <strong>Swiss-made</strong> watch with <span style=\"color: red;\">limited edition</span> design. Features <em>automatic movement</em> and sapphire crystal.</p>",
  "price_cents": 1299900,
  "category": "Accessories",
  "image_url": "https://storage.supabase.co/product-images/watch.jpg"
}
```

### Generated Meta Tags
```html
<title>Luxury Watch – Available on A2Z Sellr</title>
<!-- HTML tags are stripped, only text remains -->
<meta name="description" content="Premium Swiss-made watch with limited edition design. Features automatic movement and sapphire crystal.">

<meta property="og:title" content="Luxury Watch – Available on A2Z Sellr">
<meta property="og:description" content="Premium Swiss-made watch with limited edition design. Features automatic movement and sapphire crystal.">
<meta property="og:image" content="https://storage.supabase.co/product-images/watch.jpg">
```

---

## Example 6: Profile Page (No Product)

### URL
```
https://www.a2zsellr.life/profile/john-doe
```

### Generated Meta Tags
```html
<title>John Doe | A2Z Sellr</title>
<meta name="description" content="Check out John Doe's business profile on A2Z Sellr. Fashion & Accessories in Johannesburg">

<meta property="og:title" content="John Doe | A2Z Sellr">
<meta property="og:description" content="Check out John Doe's business profile on A2Z Sellr. Fashion & Accessories in Johannesburg">
<meta property="og:image" content="https://storage.supabase.co/avatars/john-doe.jpg">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.a2zsellr.life/profile/john-doe">
<meta property="og:site_name" content="A2Z Sellr">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="John Doe | A2Z Sellr">
<meta name="twitter:description" content="Check out John Doe's business profile on A2Z Sellr. Fashion & Accessories in Johannesburg">
<meta name="twitter:image" content="https://storage.supabase.co/avatars/john-doe.jpg">
```

---

## Testing These Examples

### Using Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/og/object/
2. Paste product URL: `https://www.a2zsellr.life/profile/john-doe?product=premium-leather-jacket`
3. Click "Scrape Again"
4. See the generated preview

### Using Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Paste product URL
3. See the Twitter card preview

### Using WhatsApp
1. Copy product URL
2. Paste in WhatsApp chat
3. See the preview with image, title, and description

---

## Key Points

✅ **Title Format:** `{Product Name} – Available on A2Z Sellr`

✅ **Description:** First 150 characters of product description (HTML stripped)

✅ **Image:** First image from product.images array, or product.image_url, or default

✅ **URL:** `https://www.a2zsellr.life/profile/{username}?product={slug}`

✅ **Fallbacks:** All fields have sensible defaults if data is missing

✅ **HTML Handling:** All HTML tags are stripped from descriptions for meta tags
