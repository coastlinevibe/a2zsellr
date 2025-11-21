# Bulk Upload Preview Improvements

## Changes Made

### 1. Tier Selection Added
- ✅ Added dropdown to select subscription tier in preview
- ✅ Options: Free, Premium, Business
- ✅ Default: Premium
- ✅ Tier is sent to API and applied to all uploaded profiles

### 2. Enhanced Preview Table
- ✅ Shows ALL profiles (not just first 5)
- ✅ Displays ALL columns from CSV:
  - Business Name
  - Email (shows "Auto-generated" if missing)
  - Phone (shows default if missing)
  - Address
  - City
  - Province
  - Website (shows "Auto-generated" if missing)
  - Category (with colored badge)
  - Facebook URL (shows "Auto-generated" if missing)

### 3. Improved UI
- ✅ Scrollable table (max height 96 units)
- ✅ Sticky header stays visible while scrolling
- ✅ Hover effect on rows
- ✅ Truncated long text with tooltips
- ✅ Better spacing and readability
- ✅ Shows total count at bottom

## How It Works

### Preview Flow:
1. Upload CSV file
2. Click "PREVIEW DATA"
3. See all profiles with all columns
4. Select desired tier from dropdown
5. Click "CONFIRM & CREATE"
6. All profiles created with selected tier

### Tier Options:

**FREE (R0/month)**
- 3 gallery images
- 5 products
- 3 listings
- 5-minute reset (testing mode)

**PREMIUM (R149/month)** - Default
- Unlimited gallery & products
- Full e-commerce
- WhatsApp & Facebook marketing
- Google Maps

**BUSINESS (R299/month)**
- Everything in Premium
- Multi-location management
- Instagram automation
- Advanced analytics
- Bulk upload access

## Preview Table Columns

| Column | Description | Auto-Generated If Missing |
|--------|-------------|---------------------------|
| Business Name | Company/business name | ❌ Required |
| Email | Contact email | ✅ businessname@example.com |
| Phone | Contact number | ✅ +27 81 234 5678 |
| Address | Physical address | ❌ From CSV |
| City | City/town | ❌ From CSV |
| Province | Province/state | ❌ From CSV |
| Website | Website URL | ✅ https://businessname.co.za |
| Category | Business category | ❌ From CSV |
| Facebook | Facebook page URL | ✅ Auto-generated |

## Technical Details

### Component Changes
**File**: `components/BulkUploadManager.tsx`
- Added `selectedTier` state
- Added tier dropdown in preview
- Expanded table to show all columns
- Made table scrollable with sticky header
- Shows all profiles instead of just 5

### API Changes
**File**: `app/api/admin/bulk-upload/route.ts`
- Accepts `tier` parameter from form data
- Applies selected tier to all profiles
- Defaults to 'premium' if not specified

### Preview Data Structure
```typescript
{
  totalCount: number,
  expectedProducts: number,
  profiles: [
    {
      display_name: string,
      email: string | null,
      phone_number: string | null,
      address: string | null,
      city: string,
      province: string,
      website_url: string | null,
      business_category: string,
      facebook_url: string | null,
      instagram_url: string | null,
      twitter_url: string | null,
      business_location: string
    }
  ]
}
```

## Benefits

1. **Full Visibility**: See exactly what will be imported
2. **Tier Control**: Choose appropriate tier for bulk uploads
3. **Data Validation**: Verify all fields before import
4. **Missing Data Detection**: See which fields will be auto-generated
5. **Better UX**: Scrollable table with all information visible

## Usage Example

### Scenario: Importing 20 Butcheries

1. **Upload CSV** with butchery data
2. **Preview** shows:
   - 20 profiles
   - 200 products (10 per profile)
   - All business details
3. **Select Tier**: Choose "Business" for full features
4. **Confirm**: All 20 butcheries created with Business tier
5. **Result**: 
   - 20 auth users created (password: 123456)
   - 20 profiles with Business subscription
   - 200 butchery products auto-created
   - All can login immediately

## Notes

- All profiles in a single upload get the same tier
- Tier can be changed later via admin dashboard
- Auto-generated data follows consistent patterns
- Preview is read-only (no editing before import)
- Tier selection is saved for the upload session

---

**Status**: ✅ Complete
**Last Updated**: November 21, 2025
