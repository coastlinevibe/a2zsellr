import { NextRequest, NextResponse } from 'next/server'
import { parseBulkUploadCSV, validateProfileData } from '@/lib/bulkUploadUtils'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUyNTU2NiwiZXhwIjoyMDc2MTAxNTY2fQ.m96uClWOYZTspFko_ofQ2Q_Euf4gze0',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Parse CSV file
    const csvText = await file.text()
    console.log('📄 CSV Text received for preview:', csvText.substring(0, 500))
    
    const profilesData = await parseBulkUploadCSV(csvText)
    console.log('📊 Parsed profiles count for preview:', profilesData.length)

    if (profilesData.length === 0) {
      return NextResponse.json(
        { error: 'No valid profiles found in CSV', csvPreview: csvText.substring(0, 200) },
        { status: 400 }
      )
    }

    // Validate data
    const validationResults = await validateProfileData(profilesData)
    const validProfiles = validationResults.valid
    const errors = validationResults.errors
    
    console.log('✅ Valid profiles count for preview:', validProfiles.length)
    console.log('❌ Validation errors for preview:', errors)

    // Check for existing profiles with same display names
    const displayNames = validProfiles.map(p => p.display_name)
    const { data: existingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .in('display_name', displayNames)

    const existingNames = existingProfiles?.map(p => p.display_name) || []
    const duplicateWarnings = existingNames.length > 0 
      ? [`Found ${existingNames.length} existing business names that will be renamed: ${existingNames.join(', ')}`]
      : []

    const allWarnings = [...errors, ...duplicateWarnings]

    return NextResponse.json({
      success: true,
      preview: {
        profiles: validProfiles,
        totalCount: validProfiles.length,
        expectedProducts: validProfiles.length * 10, // 10 products per profile
        errors: allWarnings.length > 0 ? allWarnings : null,
        columns: profilesData.length > 0 ? Object.keys(profilesData[0]) : [],
        duplicatesFound: existingNames.length,
        existingNames: existingNames
      }
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}