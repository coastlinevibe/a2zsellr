import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { parseBulkUploadCSV, validateProfileData, createMissingLocations } from '@/lib/bulkUploadUtils'
import { getDefaultProductsForCategory } from '@/lib/defaultProducts'

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

// Generate default avatar URL based on business name
function generateDefaultAvatar(businessName: string): string {
  const initials = businessName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
  
  // Use a service like UI Avatars to generate avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200&bold=true`
}

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
    console.log('📄 CSV Text received:', csvText.substring(0, 500)) // Log first 500 chars
    
    const profilesData = await parseBulkUploadCSV(csvText)
    console.log('📊 Parsed profiles count:', profilesData.length)
    console.log('📊 First profile:', profilesData[0])

    if (profilesData.length === 0) {
      // Get the first line to show headers
      const lines = csvText.trim().split('\n')
      const headers = lines.length > 0 ? lines[0] : 'No headers found'
      
      return NextResponse.json(
        { 
          error: 'No valid profiles found in CSV', 
          details: 'Please check your CSV format and ensure it has the required columns',
          csvHeaders: headers,
          expectedFormat: 'Keyword, Company Name, Address, Location, Website, Contact No, Email, Facebook Page URL',
          csvPreview: csvText.substring(0, 300)
        },
        { status: 400 }
      )
    }

    // Validate data
    const validationResults = await validateProfileData(profilesData)
    const validProfiles = validationResults.valid
    const errors = validationResults.errors
    
    console.log('✅ Valid profiles count:', validProfiles.length)
    console.log('❌ Validation errors:', errors)

    if (validProfiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid profiles after validation', errors, rawProfiles: profilesData },
        { status: 400 }
      )
    }

    // Create missing locations
    const locationResults = await createMissingLocations(validProfiles)

    // Check for existing profiles with same display names
    const displayNames = validProfiles.map(p => p.display_name)
    const { data: existingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .in('display_name', displayNames)

    const existingNames = new Set(existingProfiles?.map(p => p.display_name) || [])
    
    // Filter out profiles that already exist and add unique suffixes
    const uniqueProfiles = validProfiles.map(profile => {
      let uniqueName = profile.display_name
      let counter = 1
      
      // If name exists, add a suffix
      while (existingNames.has(uniqueName)) {
        uniqueName = `${profile.display_name} (${counter})`
        counter++
      }
      
      // Add to existing names set to prevent duplicates within this batch
      existingNames.add(uniqueName)
      
      return {
        ...profile,
        display_name: uniqueName,
        originalName: profile.display_name
      }
    })

    console.log('🔍 Unique profiles after duplicate check:', uniqueProfiles.length)

    // Prepare profiles for insertion (matching existing schema)
    const profilesToInsert = uniqueProfiles.map(profile => {
      const profileId = crypto.randomUUID()
      
      // Generate default email if missing
      const defaultEmail = profile.email || `${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
      
      // Generate default phone if missing
      const defaultPhone = profile.phone_number || '+27 81 234 5678'
      
      // Generate default website if missing
      const defaultWebsite = profile.website_url || `https://www.${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`
      
      // Generate default bio/address if missing
      const defaultBio = profile.address || `Located in ${profile.city || profile.business_location || 'South Africa'}. Providing quality ${profile.business_category.toLowerCase()} services to our community.`
      
      return {
        id: profileId,
        display_name: profile.display_name,
        email: defaultEmail,
        bio: defaultBio,
        phone_number: defaultPhone,
        website_url: defaultWebsite,
        business_category: profile.business_category,
        business_location: profile.business_location || 'south-africa',
        business_hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 2:00 PM',
        avatar_url: generateDefaultAvatar(profile.display_name),
        subscription_tier: 'business',
        subscription_status: 'active',
        verified_seller: false,
        is_active: true,
        current_listings: 0,
        // Social media URLs using individual columns
        facebook: profile.facebook_url || `https://facebook.com/${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        instagram: profile.instagram_url || `https://instagram.com/${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        twitter: profile.twitter_url || `https://twitter.com/${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        youtube: `https://youtube.com/@${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    console.log(`📝 Inserting ${profilesToInsert.length} profiles...`)
    console.log('📋 First profile to insert:', {
      display_name: profilesToInsert[0]?.display_name,
      subscription_tier: profilesToInsert[0]?.subscription_tier,
      business_category: profilesToInsert[0]?.business_category,
      email: profilesToInsert[0]?.email
    })

    // Insert profiles using admin client to bypass RLS
    const { data: insertedProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profilesToInsert)
      .select('id, display_name, subscription_tier, business_category')

    if (profileError) {
      console.error('Profile insertion error:', profileError)
      return NextResponse.json(
        { error: 'Failed to insert profiles', details: profileError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Inserted ${insertedProfiles?.length || 0} profiles`)
    console.log('📋 First inserted profile:', insertedProfiles?.[0])

    // Create default products for each profile
    const allProducts = []

    for (let i = 0; i < (insertedProfiles || []).length; i++) {
      const profile = insertedProfiles![i]
      const originalProfile = uniqueProfiles[i]
      
      console.log(`🛍️ Creating products for profile: ${profile.display_name}`)
      console.log(`📂 Business category: "${originalProfile.business_category}"`)
      
      const defaultProducts = getDefaultProductsForCategory(originalProfile.business_category)
      console.log(`📦 Generated ${defaultProducts.length} products for category: ${originalProfile.business_category}`)
      
      const profileProducts = defaultProducts.map(product => ({
        id: crypto.randomUUID(),
        profile_id: profile.id,
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        currency: 'ZAR', // South African Rand
        category: originalProfile.business_category, // Use the actual category from CSV
        image_url: null, // No images initially
        is_active: true,
        images: null, // No images array initially
        product_details: product.details || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      allProducts.push(...profileProducts)
      
      console.log(`✅ Added ${profileProducts.length} products for ${profile.display_name}`)
    }

    console.log(`🛒 Total products to insert: ${allProducts.length}`)

    // Insert products using admin client to bypass RLS
    const { data: insertedProducts, error: productError } = await supabaseAdmin
      .from('profile_products')
      .insert(allProducts)
      .select('id')

    if (productError) {
      console.error('Product insertion error:', productError)
      return NextResponse.json(
        { error: 'Failed to insert products', details: productError.message },
        { status: 500 }
      )
    }

    console.log('✅ Products inserted successfully:', insertedProducts?.length || 0)

    // Create authentication credentials for users with default password "123456"
    const authResults = []
    for (let i = 0; i < (insertedProfiles || []).length; i++) {
      const profile = insertedProfiles![i]
      const profileData = profilesToInsert[i]
      
      try {
        console.log(`🔐 Creating auth for user: ${profile.display_name} (${profileData.email})`)
        
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: profileData.email,
          password: '123456', // Default password for all bulk uploaded users
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            display_name: profile.display_name,
            business_category: profileData.business_category,
            bulk_uploaded: true
          }
        })

        if (authError) {
          console.error(`❌ Auth creation failed for ${profile.display_name}:`, authError.message)
          authResults.push({
            profile: profile.display_name,
            email: profileData.email,
            success: false,
            error: authError.message
          })
        } else {
          console.log(`✅ Auth created for ${profile.display_name}`)
          authResults.push({
            profile: profile.display_name,
            email: profileData.email,
            success: true,
            userId: authData.user?.id
          })
          
          // Update the profile with the correct auth user ID
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ id: authData.user!.id })
            .eq('id', profile.id)
          
          if (updateError) {
            console.error(`❌ Failed to update profile ID for ${profile.display_name}:`, updateError)
          } else {
            console.log(`✅ Updated profile ID for ${profile.display_name}: ${profile.id} -> ${authData.user!.id}`)
          }
        }
      } catch (authErr) {
        console.error(`❌ Auth creation error for ${profile.display_name}:`, authErr)
        authResults.push({
          profile: profile.display_name,
          email: profileData.email,
          success: false,
          error: authErr instanceof Error ? authErr.message : 'Unknown error'
        })
      }
    }

    const successfulAuth = authResults.filter(r => r.success).length
    const failedAuth = authResults.filter(r => !r.success)

    console.log(`🔐 Authentication results: ${successfulAuth} successful, ${failedAuth.length} failed`)

    // Check for renamed profiles
    const renamedProfiles = uniqueProfiles
      .filter(p => p.originalName && p.display_name !== p.originalName)
      .map(p => `"${p.originalName}" → "${p.display_name}"`)

    const allWarnings = [
      ...(errors.length > 0 ? errors : []),
      ...(renamedProfiles.length > 0 ? [`Renamed duplicates: ${renamedProfiles.join(', ')}`] : []),
      ...(failedAuth.length > 0 ? [`Auth creation failed for: ${failedAuth.map(f => f.profile).join(', ')}`] : [])
    ]

    return NextResponse.json({
      success: true,
      message: 'Bulk upload completed successfully',
      results: {
        profilesCreated: insertedProfiles?.length || 0,
        productsCreated: allProducts.length,
        locationsCreated: locationResults.created,
        authCreated: successfulAuth,
        authFailed: failedAuth.length,
        defaultPassword: '123456', // Include in response for admin reference
        errors: allWarnings.length > 0 ? allWarnings : null,
        renamedCount: renamedProfiles.length,
        authDetails: failedAuth.length > 0 ? failedAuth : undefined
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
