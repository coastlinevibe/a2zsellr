import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    console.log('🔍 Testing storage configuration...')
    console.log(`🌐 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    console.log(`🔑 Service role key available: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    
    // Test product-images bucket
    const { data: productBucketFiles, error: productBucketError } = await supabaseAdmin.storage
      .from('product-images')
      .list('', { limit: 1 })
    
    console.log('📦 Product images bucket test:', { 
      success: !productBucketError, 
      error: productBucketError?.message,
      fileCount: productBucketFiles?.length 
    })
    
    // Test sharelinks bucket
    const { data: galleryBucketFiles, error: galleryBucketError } = await supabaseAdmin.storage
      .from('sharelinks')
      .list('', { limit: 1 })
    
    console.log('🖼️ Sharelinks bucket test:', { 
      success: !galleryBucketError, 
      error: galleryBucketError?.message,
      fileCount: galleryBucketFiles?.length 
    })
    
    // Test creating a small test file
    const testContent = new Blob(['test'], { type: 'text/plain' })
    const testFileName = `test-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      })
    
    console.log('📤 Test upload:', { 
      success: !uploadError, 
      error: uploadError?.message,
      path: uploadData?.path 
    })
    
    // Clean up test file
    if (uploadData?.path) {
      await supabaseAdmin.storage
        .from('product-images')
        .remove([uploadData.path])
      console.log('🗑️ Test file cleaned up')
    }
    
    return NextResponse.json({
      success: true,
      results: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKeyAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        productImagesBucket: {
          accessible: !productBucketError,
          error: productBucketError?.message,
          fileCount: productBucketFiles?.length
        },
        sharelinksBucket: {
          accessible: !galleryBucketError,
          error: galleryBucketError?.message,
          fileCount: galleryBucketFiles?.length
        },
        testUpload: {
          success: !uploadError,
          error: uploadError?.message,
          path: uploadData?.path
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Storage test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Storage test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}