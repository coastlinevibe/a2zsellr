# Listing Builder - Video & Menu Integration

## ✅ What's Been Added to the Listing Builder

### 1. **New State Variables**
- `videoUrl` - YouTube URL or uploaded video URL
- `videoType` - 'youtube' or 'upload'
- `menuImages` - Array of menu image objects
- `useGlobalVideo` - Toggle for global video preference
- `useGlobalMenu` - Toggle for global menu preference
- `uploadingVideo` - Loading state for video uploads
- `uploadingMenuImages` - Loading state for menu uploads

### 2. **Video Section**
**Location:** Added between "Message Template" and "Media Selection"

**Features:**
- **Video Type Toggle:** Switch between YouTube link and file upload
- **YouTube Input:** URL field for YouTube videos with validation
- **Video Upload:** File picker for MP4/video files
- **Upload Progress:** Loading indicator during upload
- **Preview:** Shows current video status
- **Global Save:** "🌐 Save Global" button to set as business default
- **Remove Option:** Clear video functionality

**Storage:** Videos uploaded to `sharelinks/video_uploads/{profile_id}/`

### 3. **Menu Section**
**Location:** Added after Video section

**Features:**
- **Multi-Image Upload:** Select multiple menu images at once
- **Upload Progress:** Loading indicator during upload
- **Image Preview Grid:** 3-column grid showing uploaded images
- **Image Management:** Remove individual images or clear all
- **Global Save:** "🌐 Save Global" button to set as business default
- **Image Names:** Displays filename (without extension) as overlay

**Storage:** Menu images uploaded to `gallery/menu_uploads/{profile_id}/`

### 4. **Upload Handlers**

#### Video Upload (`handleVideoUpload`)
- Validates file type (video/*)
- Uploads to Supabase storage
- Updates state with public URL
- Shows success/error notifications
- Resets file input after upload

#### Menu Images Upload (`handleMenuImagesUpload`)
- Handles multiple files simultaneously
- Validates each file as image
- Generates unique filenames with timestamps
- Creates structured menu objects with order
- Shows batch upload progress

### 5. **Global Save Functionality**

#### `saveAsGlobal` Function
- Saves video/menu to profile table as global defaults
- Updates `global_video_url`, `global_video_type`, `global_menu_images`
- Shows success notifications
- Allows reuse across all campaigns

### 6. **Database Integration**

#### Save Function Updates
Added to `campaignData` object in `handleSaveDraft`:
```javascript
video_url: videoUrl.trim() || null,
video_type: videoUrl.trim() ? videoType : null,
menu_images: menuImages.length > 0 ? menuImages : null
```

#### Data Structure
**Video Data:**
- `video_url`: Full URL (YouTube or Supabase storage)
- `video_type`: 'youtube' | 'upload'

**Menu Data:**
- `menu_images`: Array of objects with `id`, `url`, `name`, `order`

### 7. **User Experience Features**

#### Visual Design
- Consistent blue theme matching existing design
- Clear section headers with optional badges
- Hover effects and transitions
- Loading states with spinners
- Success/error visual feedback

#### Validation & Error Handling
- File type validation for videos and images
- Upload error handling with user-friendly messages
- Progress indicators for long operations
- Confirmation for destructive actions

#### Smart Defaults
- YouTube as default video type
- Auto-generated menu item names from filenames
- Proper ordering for menu images
- Graceful handling of missing data

## 🎯 How It Works

### For Business Owners:
1. **Create/Edit Campaign** → Go to Marketing → Listing Builder
2. **Add Video** → Choose YouTube link or upload file
3. **Add Menu** → Upload multiple menu images
4. **Save Global** → Click "🌐 Save Global" to reuse across campaigns
5. **Save Campaign** → Video/menu data saved with campaign

### For Customers:
1. **Visit Campaign Page** → See the 5 action buttons
2. **Click "Watch Video"** → Video popup opens (YouTube or uploaded)
3. **Click "Browse Menu"** → Menu gallery popup opens
4. **Click "Latest Items"** → Product popup shows newest items

### Data Priority:
- **Campaign-specific** video/menu takes priority
- **Falls back** to global business video/menu if campaign has none
- **Graceful degradation** if no content available

## 🔧 Technical Implementation

### File Upload Flow:
1. User selects files → Validation → Upload to Supabase Storage
2. Generate public URLs → Update component state
3. Save to database on campaign save
4. Display in public campaign view

### Storage Organization:
```
sharelinks/
└── video_uploads/
    └── {profile_id}/
        └── video-{timestamp}-{filename}

gallery/
└── menu_uploads/
    └── {profile_id}/
        └── menu-{timestamp}-{index}-{filename}
```

### State Management:
- React hooks for all video/menu state
- Proper cleanup on component unmount
- Loading states for better UX
- Error boundaries for upload failures

---

**Status: Listing Builder Integration Complete ✅**

Business owners can now add videos and menu images to their campaigns through the listing builder interface. The data flows seamlessly to the public campaign view where customers can interact with the new action buttons.