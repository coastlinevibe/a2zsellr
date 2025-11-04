# Image Upload Fix for Marketing Campaigns

## Issues Fixed

### 1. **Database Schema Issues**
- ✅ Added `platform_settings` JSONB column to `marketing_campaigns` table
- ✅ Created `campaign_media` table for better media management
- ✅ Added proper RLS policies for security

### 2. **Image Storage Issues**
- ✅ Replaced temporary blob URLs with permanent Supabase Storage URLs
- ✅ Created proper upload utility with validation
- ✅ Added upload progress indicators and error handling

### 3. **Database Tables for Images**
Images are now stored in:
- **`marketing_campaigns.platform_settings`** - JSON metadata about uploaded media
- **`campaign_media`** - Dedicated table for campaign media files
- **Supabase Storage bucket: `campaign-media`** - Actual file storage

## Files Modified

### 1. Database Schema
- `sql/fix-marketing-campaigns-media.sql` - Adds platform_settings column and campaign_media table
- `sql/setup-storage-bucket.sql` - Creates Supabase Storage bucket with RLS policies

### 2. Upload Utilities
- `lib/uploadUtils.ts` - New utility for Supabase Storage operations
  - `uploadFileToStorage()` - Upload files with validation
  - `deleteFileFromStorage()` - Delete files from storage
  - `saveCampaignMedia()` - Save media records to database

### 3. Campaign Builder
- `components/ui/wysiwyg-campaign-builder.tsx` - Updated upload functionality
  - Proper async file upload with progress indicators
  - Storage path tracking
  - Error handling and user feedback

## Setup Instructions

### 1. Run Database Migrations
Execute these SQL files in your Supabase SQL editor:

```sql
-- 1. Fix marketing campaigns table
\i sql/fix-marketing-campaigns-media.sql

-- 2. Setup storage bucket
\i sql/setup-storage-bucket.sql
```

### 2. Verify Storage Bucket
In Supabase Dashboard:
1. Go to Storage
2. Verify `campaign-media` bucket exists
3. Check bucket policies are active

### 3. Test Upload Functionality
1. Go to Dashboard > Marketing > Campaign Builder
2. Try uploading an image/video
3. Verify:
   - Upload progress shows
   - File appears in preview
   - Campaign saves successfully
   - Media displays on campaign page

## How It Works Now

### Upload Process
1. **File Selection** - User selects files via file input
2. **Validation** - File type and size validation
3. **Preview** - Temporary blob URL for immediate preview
4. **Upload** - File uploaded to Supabase Storage
5. **Update** - Preview URL replaced with permanent Storage URL
6. **Save** - Media metadata saved to database

### Storage Structure
```
campaign-media/
├── uploads/
│   ├── {user-id}/
│   │   ├── {timestamp}_{random}.jpg
│   │   ├── {timestamp}_{random}.mp4
│   │   └── ...
```

### Database Structure
```json
// marketing_campaigns.platform_settings
{
  "selected_products": ["product-id-1", "product-id-2"],
  "uploaded_media": [
    {
      "id": "upload-123-456",
      "name": "image.jpg",
      "url": "https://supabase.co/storage/v1/object/public/campaign-media/uploads/user-id/file.jpg",
      "type": "image/jpeg",
      "storage_path": "uploads/user-id/file.jpg"
    }
  ]
}
```

## Benefits

1. **Persistent Storage** - Images survive page refreshes and sessions
2. **Proper URLs** - Public URLs that work across domains
3. **Security** - RLS policies ensure users only access their files
4. **Performance** - Optimized storage with CDN delivery
5. **Scalability** - Proper file organization and cleanup
6. **User Experience** - Upload progress and error handling

## Next Steps

1. **Test thoroughly** - Upload various file types and sizes
2. **Monitor storage usage** - Set up alerts for storage limits
3. **Add file cleanup** - Implement deletion of unused files
4. **Optimize images** - Consider image compression/resizing
5. **Add more file types** - Support for additional media formats if needed

## Troubleshooting

### Common Issues

1. **Upload fails with 404**
   - Check if storage bucket exists
   - Verify RLS policies are active

2. **Images don't display**
   - Check if URLs are properly formed
   - Verify bucket is public

3. **Permission denied**
   - Check user authentication
   - Verify RLS policies match user ID

### Debug Commands

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'campaign-media';

-- Check RLS policies
SELECT * FROM storage.policies WHERE bucket_id = 'campaign-media';

-- Check uploaded files
SELECT * FROM storage.objects WHERE bucket_id = 'campaign-media';
```
