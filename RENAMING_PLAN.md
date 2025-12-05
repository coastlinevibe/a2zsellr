# A2Z Sellr - Component & File Renaming Plan

## PROBLEM
The codebase uses confusing naming conventions:
- Component is called `wysiwyg-campaign-builder.tsx` but it creates **LISTINGS** (saved to `profile_listings` table)
- Component is called `MarketingCampaignsTab.tsx` but it displays **LISTINGS**
- Component is called `ShareLinkBuilder` but it's the **LISTING BUILDER**
- Layout components are called `campaign-layouts` but they're **LISTING LAYOUTS**
- Users see "Listing" in the UI, not "Campaign"

## CORRECT TERMINOLOGY (Based on Database & UI)

### Database Tables:
- `profile_listings` - Main table for user listings ✓ CORRECT
- `marketing_campaigns` - Appears to be UNUSED/LEGACY
- `whatsapp_campaigns` - Appears to be UNUSED/LEGACY

### User-Facing Terminology:
- "Listing" - What users create and see
- "Listing Builder" - The editor
- "My Listings" - Tab showing all listings
- "Listing Layouts" - Gallery-mosaic, hover-cards, etc.

### Storage:
- `sharelinks` bucket - Stores listing media

---

## RENAMING RECOMMENDATIONS

### TIER 1: HIGH PRIORITY (Core Listing Builder)

#### 1. `components/ui/wysiwyg-campaign-builder.tsx` → `components/ui/listing-builder.tsx`
- **Reason**: Creates listings, not campaigns. Saves to `profile_listings` table.
- **Files to Update**:
  - `components/ui/share-link-builder.tsx` - imports this
  - `app/dashboard/page.tsx` - imports this
- **Impact**: HIGH - Core component
- **Breaking Changes**: Import statements only

#### 2. `components/ui/share-link-builder.tsx` → `components/ui/listing-editor.tsx`
- **Reason**: It's the listing editor wrapper, not just for share links
- **Files to Update**:
  - `app/dashboard/page.tsx` - imports this
- **Impact**: MEDIUM - Wrapper component
- **Breaking Changes**: Import statements only

#### 3. `components/ui/campaign-layouts/` → `components/ui/listing-layouts/`
- **Reason**: These are listing layouts, not campaign layouts
- **Files to Update**:
  - `components/ui/listing-builder.tsx` - imports from this
  - `components/ui/campaign-layouts/index.tsx` - rename to `listing-layouts/index.tsx`
  - All files inside: `GalleryMosaicLayout.tsx`, `HoverCardsLayout.tsx`, etc.
- **Impact**: HIGH - Core layouts
- **Breaking Changes**: Import paths

#### 4. `components/dashboard/MarketingCampaignsTab.tsx` → `components/dashboard/ListingsTab.tsx`
- **Reason**: Displays listings, not campaigns
- **Files to Update**:
  - `app/dashboard/page.tsx` - imports this
- **Impact**: MEDIUM - Dashboard tab
- **Breaking Changes**: Import statements only

### TIER 2: MEDIUM PRIORITY (Related Components)

#### 5. `components/ui/campaign-scheduler.tsx` → `components/ui/listing-scheduler.tsx`
- **Reason**: Schedules listings, not campaigns
- **Files to Update**:
  - `app/dashboard/page.tsx` - imports this
- **Impact**: MEDIUM - Premium feature
- **Breaking Changes**: Import statements only

#### 6. `components/ui/analytics-dashboard.tsx` → `components/ui/listing-analytics.tsx`
- **Reason**: Tracks listing analytics, not campaign analytics
- **Files to Update**:
  - `app/dashboard/page.tsx` - imports this
- **Impact**: MEDIUM - Premium feature
- **Breaking Changes**: Import statements only

### TIER 3: LOW PRIORITY (Variable/State Names)

#### 7. Variable Renaming in `app/dashboard/page.tsx`
- `marketingActiveView` → `listingActiveView`
- `editListing` → Keep (already correct)
- `marketingProducts` → `listingProducts`
- `savedTemplates` → Keep (already correct)

#### 8. Variable Renaming in `components/whatsapp/steps/StepWhat.tsx`
- `selectedListings` → Keep (already correct)
- `listings` → Keep (already correct)

---

## DATABASE CLEANUP (SEPARATE TASK)

### Tables to Investigate:
1. **`marketing_campaigns`** - Check if actually used
   - Search for any references in code
   - If unused, can be deleted from database
   
2. **`whatsapp_campaigns`** - Check if actually used
   - Search for any references in code
   - If unused, can be deleted from database

### Current Status:
- `profile_listings` - ACTIVE ✓
- `marketing_campaigns` - APPEARS UNUSED (only in delete operations)
- `whatsapp_campaigns` - APPEARS UNUSED (only in delete operations)

---

## IMPLEMENTATION STEPS

### Step 1: Rename Core Files
```
components/ui/wysiwyg-campaign-builder.tsx → components/ui/listing-builder.tsx
components/ui/share-link-builder.tsx → components/ui/listing-editor.tsx
components/ui/campaign-layouts/ → components/ui/listing-layouts/
components/dashboard/MarketingCampaignsTab.tsx → components/dashboard/ListingsTab.tsx
components/ui/campaign-scheduler.tsx → components/ui/listing-scheduler.tsx
components/ui/analytics-dashboard.tsx → components/ui/listing-analytics.tsx
```

### Step 2: Update All Imports
- `app/dashboard/page.tsx` - Update 6 imports
- `components/ui/listing-builder.tsx` - Update layout imports
- Any other files importing these components

### Step 3: Update Variable Names
- `app/dashboard/page.tsx` - Rename state variables
- `components/whatsapp/steps/StepWhat.tsx` - Already correct

### Step 4: Update UI Text (Optional but Recommended)
- Component comments
- Error messages
- Console logs

---

## VERIFICATION CHECKLIST

After renaming, verify:
- [ ] All imports resolve correctly
- [ ] No TypeScript errors
- [ ] Listing builder still works
- [ ] Listings tab still displays listings
- [ ] Scheduler still works
- [ ] Analytics still work
- [ ] No console errors
- [ ] Build completes successfully

---

## SUMMARY

**Total Files to Rename**: 6 main files + 1 directory
**Total Import Updates**: ~10-15 files
**Estimated Time**: 30-45 minutes
**Risk Level**: LOW (mostly import/naming changes, no logic changes)
**Breaking Changes**: None (internal only)

**Benefits**:
- ✓ Clearer codebase
- ✓ Easier to understand for new developers
- ✓ Matches user-facing terminology
- ✓ Matches database table names
- ✓ Reduces confusion
