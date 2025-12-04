import { supabase } from './supabaseClient'

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - Storage bucket name (default: 'campaign-media')
 * @param folder - Folder path within bucket (default: 'uploads')
 * @returns Promise with upload result
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string = 'sharelinks',
  folder: string = 'campaign-uploads'
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File type not supported. Please use JPG, PNG, WebP, GIF, MP4, or WebM.' }
    }

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 1MB' }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      
      // Provide more specific error messages
      if (error.message.includes('Bucket not found')) {
        return { success: false, error: `Storage bucket '${bucket}' not found. Please check your Supabase Storage configuration.` }
      }
      if (error.message.includes('row level security')) {
        return { success: false, error: 'Permission denied. Please check storage bucket policies.' }
      }
      
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get public URL' }
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    return { success: false, error: error.message || 'Upload failed' }
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 * @returns Promise with deletion result
 */
export async function deleteFileFromStorage(
  path: string,
  bucket: string = 'sharelinks'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error: any) {
    console.error('Delete error:', error)
    return { success: false, error: error.message || 'Delete failed' }
  }
}

/**
 * Save campaign media record to database
 * @param campaignId - Campaign ID
 * @param profileId - Profile ID
 * @param file - Original file
 * @param uploadResult - Result from uploadFileToStorage
 * @returns Promise with database result
 */
export async function saveCampaignMedia(
  campaignId: string,
  profileId: string,
  file: File,
  uploadResult: UploadResult
) {
  try {
    if (!uploadResult.success || !uploadResult.url || !uploadResult.path) {
      throw new Error('Invalid upload result')
    }

    const { data, error } = await supabase
      .from('campaign_media')
      .insert({
        campaign_id: campaignId,
        profile_id: profileId,
        file_name: file.name,
        file_url: uploadResult.url,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadResult.path
      })
      .select()
      .single()

    if (error) {
      console.error('Database save error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }

  } catch (error: any) {
    console.error('Save media error:', error)
    return { success: false, error: error.message || 'Failed to save media record' }
  }
}
