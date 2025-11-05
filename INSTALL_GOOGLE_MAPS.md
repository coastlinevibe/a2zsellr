# Quick Install: Google Maps

## Step 1: Install TypeScript Types
```bash
npm install --save-dev @types/google.maps
```

This will resolve all TypeScript errors.

## Step 2: Get API Key
1. Go to https://console.cloud.google.com/
2. Create/select project
3. Enable: Maps JavaScript API, Places API, Geocoding API
4. Create API key
5. Restrict API key to your domain

## Step 3: Add to .env.local
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 4: Run Migration
```bash
# In Supabase Dashboard > SQL Editor, run:
# supabase/migrations/add_location_to_profiles.sql
```

## Done!
See `WEEK8_GOOGLE_MAPS_SETUP.md` for detailed instructions.
