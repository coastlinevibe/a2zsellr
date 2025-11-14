import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { parseBulkUploadCSV, validateProfileData, createMissingLocations } from '@/lib/bulkUploadUtils'
import { getDefaultProductsForCategory } from '@/lib/defaultProducts'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
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
    const errors = validationResults.errors

    if (validProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid profiles after validation', errors },
        { status: 400 }
      )
    }

    // Create missing locations
    const locationResults = await createMissingLocations(validProfiles)

    // Prepare profiles for insertion
    const profilesToInsert = validProfiles.map(profile => ({
      id: crypto.randomUUID(),
      display_name: profile.display_name,
      email: profile.email,
      bio: profile.bio || null,
      phone_number: profile.phone_number || null,
      website_url: profile.website_url || null,
      business_category: category,
      business_location: profile.city?.toLowerCase().replace(/\s+/g, '-') || null,
      business_hours: null,
      address: profile.address || null,
      latitude: null,
      longitude: null,
      avatar_url: null,
      subscription_tier: 'business',
      subscription_status: 'active',
      verified_seller: false,
      early_adopter: false,
      is_active: true,
      is_admin: false,
      current_listings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert profiles
    const { data: insertedProfiles, error: profileError } = await supabase
      .from('profiles')
      .insert(profilesToInsert)
      .select('id, display_name')

    if (profileError) {
      console.error('Profile insertion error:', profileError)
      return NextResponse.json(
        { error: 'Failed to insert profiles', details: profileError.message },
        { status: 500 }
      )
    }

    // Create default products for each profile
    const defaultProducts = getDefaultProductsForCategory(category)
    const allProducts = []

    for (const profile of insertedProfiles || []) {
      const profileProducts = defaultProducts.map(product => ({
        id: crypto.randomUUID(),
        profile_id: profile.id,
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        currency: 'ZAR', // South African Rand
        category: category, // Use the actual category from CSV
        type: 'product', // Default type
        image_url: null, // No images initially
        is_active: true,
        images: null, // No images array initially
        product_details: product.details || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      allProducts.push(...profileProducts)
    }

    // Insert products
    const { error: productError } = await supabase
      .from('profile_products')
      .insert(allProducts)

    if (productError) {
      console.error('Product insertion error:', productError)
      // Don't fail the entire operation for product errors
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk upload completed successfully',
      results: {
        profilesCreated: insertedProfiles?.length || 0,
        productsCreated: allProducts.length,
        locationsCreated: locationResults.created,
        errors: errors.length > 0 ? errors : null
      }
    })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
