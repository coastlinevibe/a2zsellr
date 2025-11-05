# 🗺️ Week 8: Google Maps Integration - Setup Guide

**Status:** Implementation Complete - Requires Configuration  
**Date:** 2025-11-05

---

## 📋 Prerequisites

Before using Google Maps features, you need to:

1. **Get a Google Maps API Key**
2. **Install TypeScript types**
3. **Run database migration**
4. **Configure environment variables**

---

## 🔑 Step 1: Get Google Maps API Key

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### 1.2 Enable Required APIs

Enable these APIs in your project:
- **Maps JavaScript API** (for interactive maps)
- **Places API** (for address autocomplete)
- **Geocoding API** (for address ↔ coordinates conversion)

### 1.3 Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy your API key
4. **Restrict your API key** (recommended):
   - Application restrictions: HTTP referrers
   - Add your domains: `localhost:3000`, `yourdomain.com`
   - API restrictions: Select only the 3 APIs above

---

## 📦 Step 2: Install Dependencies

Run this command to install Google Maps TypeScript types:

```bash
npm install --save-dev @types/google.maps
```

This will resolve all TypeScript errors related to `google` namespace.

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Update .env.local

Add your Google Maps API key to `.env.local`:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3.2 Verify .env.example

The `.env.example` file has been created with the required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Step 4: Run Database Migration

### 4.1 Apply Migration

Run the migration to add location columns to the `profiles` table:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard > SQL Editor
```

### 4.2 Migration Details

The migration adds:
- `latitude` (DECIMAL 10,8) - Business latitude coordinate
- `longitude` (DECIMAL 11,8) - Business longitude coordinate  
- `address` (TEXT) - Formatted address from Google Maps
- Index on `(latitude, longitude)` for location-based queries

**File:** `supabase/migrations/add_location_to_profiles.sql`

---

## 🧩 Components Created

### 1. **GoogleMapPicker** (Interactive Editor)
**File:** `components/GoogleMapPicker.tsx`

**Features:**
- Interactive map with draggable marker
- Address search with autocomplete
- Click to place marker
- Current location detection
- Restricted to South Africa by default

**Usage:**
```tsx
import GoogleMapPicker from '@/components/GoogleMapPicker'

<GoogleMapPicker
  initialCoordinates={{ lat: -26.2041, lng: 28.0473 }}
  initialAddress="Johannesburg, South Africa"
  onLocationSelect={(coords, address) => {
    console.log('Selected:', coords, address)
  }}
  height="400px"
/>
```

---

### 2. **GoogleMapDisplay** (Read-Only Display)
**File:** `components/GoogleMapDisplay.tsx`

**Features:**
- Display-only map (no editing)
- Shows business location marker
- Info window with business details
- "Get Directions" button
- Mobile-responsive

**Usage:**
```tsx
import GoogleMapDisplay from '@/components/GoogleMapDisplay'

<GoogleMapDisplay
  coordinates={{ lat: -26.2041, lng: 28.0473 }}
  address="123 Main St, Johannesburg"
  businessName="My Business"
  height="300px"
  showDirectionsButton={true}
/>
```

---

### 3. **Utility Functions**
**File:** `lib/googleMapsUtils.ts`

**Available Functions:**
- `loadGoogleMapsScript()` - Dynamically load Maps API
- `isGoogleMapsAvailable()` - Check if API is loaded
- `geocodeAddress()` - Convert address → coordinates
- `reverseGeocode()` - Convert coordinates → address
- `getDirectionsUrl()` - Generate Google Maps directions URL
- `getStaticMapUrl()` - Generate static map image URL
- `calculateDistance()` - Distance between two points
- `getCurrentLocation()` - Get user's GPS location
- `DEFAULT_COORDINATES` - Johannesburg, South Africa

---

## 🎨 Integration Points

### Where to Add Maps:

#### 1. **Profile Editor** (Dashboard)
Add `GoogleMapPicker` to the profile editing form:
- File: `app/dashboard/page.tsx` or profile edit component
- Allow users to set their business location
- Save `latitude`, `longitude`, `address` to database

#### 2. **Public Business Cards**
Add `GoogleMapDisplay` to business card views:
- File: `components/BusinessCard.tsx`
- Show location on public profiles
- Add "Get Directions" button

#### 3. **Public Profile Page**
Add map to full profile view:
- File: `components/ui/public-profile-preview.tsx`
- Larger map display
- Prominent directions button

#### 4. **Directory/Search Results**
Show mini-maps or distance indicators:
- Calculate distance from user's location
- Sort by proximity
- Show "X km away" badges

---

## 🧪 Testing Checklist

### Basic Functionality:
- [ ] Map loads without errors
- [ ] Marker appears at correct location
- [ ] Search autocomplete works
- [ ] Dragging marker updates coordinates
- [ ] Clicking map places marker
- [ ] "Current Location" button works
- [ ] "Get Directions" opens Google Maps

### Edge Cases:
- [ ] Works without API key (shows error message)
- [ ] Works with invalid coordinates
- [ ] Handles geolocation permission denied
- [ ] Mobile responsive
- [ ] Works on slow connections

### Database:
- [ ] Location saves to profiles table
- [ ] Location loads from database
- [ ] Null locations handled gracefully

---

## 🚀 Next Steps

### Immediate (Required):
1. ✅ Get Google Maps API key
2. ✅ Install `@types/google.maps`
3. ✅ Add API key to `.env.local`
4. ✅ Run database migration
5. ⏳ Integrate `GoogleMapPicker` into profile editor
6. ⏳ Add `GoogleMapDisplay` to public profiles

### Future Enhancements:
- [ ] Map-based business discovery
- [ ] "Businesses near me" feature
- [ ] Distance-based search filters
- [ ] Multiple locations per business
- [ ] Service area polygons
- [ ] Custom map styling/themes

---

## 💰 Google Maps Pricing

### Free Tier:
- **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests

### Typical Usage (Small Business):
- ~1,000 profile views/month = $7
- ~500 address searches/month = $8.50
- **Total: ~$15.50/month** (covered by free credit)

### Cost Optimization:
- Cache geocoded addresses
- Use static maps for thumbnails
- Implement map load on interaction
- Set daily quotas in Google Cloud

---

## 🔒 Security Best Practices

### API Key Restrictions:
1. **HTTP Referrer Restrictions:**
   - Add your domains only
   - Don't allow `*` (all domains)

2. **API Restrictions:**
   - Enable only required APIs
   - Disable unused APIs

3. **Usage Quotas:**
   - Set daily request limits
   - Enable billing alerts

### Environment Variables:
- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side keys
- Rotate keys if exposed

---

## 📚 Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

## ✅ Completion Checklist

- [x] Created `GoogleMapPicker` component
- [x] Created `GoogleMapDisplay` component
- [x] Created utility functions
- [x] Created database migration
- [x] Created `.env.example`
- [x] Created setup documentation
- [ ] Install `@types/google.maps` (USER ACTION REQUIRED)
- [ ] Get Google Maps API key (USER ACTION REQUIRED)
- [ ] Configure `.env.local` (USER ACTION REQUIRED)
- [ ] Run database migration (USER ACTION REQUIRED)
- [ ] Integrate into profile editor (NEXT TASK)
- [ ] Add to public profiles (NEXT TASK)

---

**Status:** Core implementation complete. Requires user configuration before integration.
