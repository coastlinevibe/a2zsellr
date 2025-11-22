import { NextRequest, NextResponse } from 'next/server'
import { parseBulkUploadCSV, validateProfileData } from '@/lib/bulkUploadUtils'
import { getDefaultProductsForCategory } from '@/lib/defaultProducts'

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
    const profilesData = await parseBulkUploadCSV(csvText)

    if (profilesData.length === 0) {
      return NextResponse.json(
        { error: 'No valid profiles found in CSV' },
        { status: 400 }
      )
    }

    // Validate data
    const validationResults = await validateProfileData(profilesData)
    const validProfiles = validationResults.valid

    if (validProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid profiles after validation' },
        { status: 400 }
      )
    }

    // Calculate expected products (10 per profile)
    const expectedProducts = validProfiles.length * 10

    return NextResponse.json({
      success: true,
      preview: {
        totalCount: validProfiles.length,
        expectedProducts: expectedProducts,
        profiles: validProfiles.map(profile => ({
          display_name: profile.display_name,
          email: profile.email,
          phone_number: profile.phone_number,
          address: profile.address,
          business_location: profile.business_location,
          website_url: profile.website_url,
          business_category: profile.business_category,
          facebook_url: profile.facebook_url
        }))
      }
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}