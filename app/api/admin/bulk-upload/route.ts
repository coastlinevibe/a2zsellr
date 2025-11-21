import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { parseBulkUploadCSV, validateProfileData, createMissingLocations } from '@/lib/bulkUploadUtils'
import { getDefaultProductsForCategory, getDefaultGalleryImage } from '@/lib/defaultProducts'

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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
    const tier = (formData.get('tier') as string) || 'premium'

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Get uploaded images
    const productImages: File[] = []
    for (let i = 0; i < 10; i++) {
      const image = formData.get(`productImage${i}`) as File
      if (image) {
        productImages.push(image)
      }
    }
    
    const galleryImage = formData.get('galleryImage') as File

    if (productImages.length !== 10) {
      return NextResponse.json(
        { error: 'Exactly 10 product images are required' },
        { status: 400 }
      )
    }

    if (!galleryImage) {
      return NextResponse.json(
        { error: 'Gallery image is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Bulk upload with tier: ${tier}`)
    console.log(`📸 Product images: ${productImages.length}`)
    console.log(`🖼️ Gallery image: ${galleryImage.name}`)
    console.log(`🔑 Service role key available: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    console.log(`🌐 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

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

    // STEP 1: Upload images to Supabase storage
    console.log('📸 Uploading images to storage...')
    
    // Check if storage buckets exist and are accessible
    try {
      console.log('🔍 Checking storage bucket accessibility...')
      const { data: productBucketFiles, error: productBucketError } = await supabaseAdmin.storage
        .from('product-images')
        .list('', { limit: 1 })
      
      if (productBucketError) {
        console.error('❌ Cannot access product-images bucket:', productBucketError)
        return NextResponse.json(
          { error: 'Cannot access product-images storage bucket', details: productBucketError.message },
          { status: 500 }
        )
      }
      
      const { data: galleryBucketFiles, error: galleryBucketError } = await supabaseAdmin.storage
        .from('sharelinks')
        .list('', { limit: 1 })
      
      if (galleryBucketError) {
        console.error('❌ Cannot access sharelinks bucket:', galleryBucketError)
        return NextResponse.json(
          { error: 'Cannot access sharelinks storage bucket', details: galleryBucketError.message },
          { status: 500 }
        )
      }
      
      console.log('✅ Storage buckets are accessible')
    } catch (error) {
      console.error('❌ Exception checking storage buckets:', error)
      return NextResponse.json(
        { error: 'Exception checking storage buckets', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
    
    const uploadedProductImages: string[] = []

    // Upload product images
    for (let i = 0; i < productImages.length; i++) {
      const image = productImages[i]
      const fileName = `bulk-upload-product-${i + 1}-${Date.now()}.${image.name.split('.').pop()}`
      
      try {
        console.log(`📸 Uploading product image ${i + 1}: ${fileName} (${image.size} bytes)`)
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('product-images')
          .upload(fileName, image, {
            contentType: image.type,
            upsert: false
          })

        if (uploadError) {
          console.error(`❌ Failed to upload product image ${i + 1}:`, uploadError)
          console.error('Upload error details:', JSON.stringify(uploadError, null, 2))
          return NextResponse.json(
            { error: `Failed to upload product image ${i + 1}`, details: uploadError.message || JSON.stringify(uploadError) },
            { status: 500 }
          )
        }

        if (!uploadData || !uploadData.path) {
          console.error(`❌ No upload data returned for product image ${i + 1}`)
          return NextResponse.json(
            { error: `No upload data returned for product image ${i + 1}`, details: 'Upload succeeded but no path returned' },
            { status: 500 }
          )
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${uploadData.path}`
        uploadedProductImages.push(imageUrl)
        console.log(`✅ Uploaded product image ${i + 1}: ${fileName} -> ${imageUrl}`)
      } catch (error) {
        console.error(`❌ Exception uploading product image ${i + 1}:`, error)
        return NextResponse.json(
          { error: `Exception uploading product image ${i + 1}`, details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    // Upload gallery image
    const galleryFileName = `bulk-upload-gallery-${Date.now()}.${galleryImage.name.split('.').pop()}`
    let galleryImageUrl = ''
    
    try {
      console.log(`🖼️ Uploading gallery image: ${galleryFileName} (${galleryImage.size} bytes)`)
      
      const { data: galleryUploadData, error: galleryUploadError } = await supabaseAdmin.storage
        .from('sharelinks')
        .upload(galleryFileName, galleryImage, {
          contentType: galleryImage.type,
          upsert: false
        })

      if (galleryUploadError) {
        console.error('❌ Failed to upload gallery image:', galleryUploadError)
        console.error('Gallery upload error details:', JSON.stringify(galleryUploadError, null, 2))
        return NextResponse.json(
          { error: 'Failed to upload gallery image', details: galleryUploadError.message || JSON.stringify(galleryUploadError) },
          { status: 500 }
        )
      }

      if (!galleryUploadData || !galleryUploadData.path) {
        console.error('❌ No upload data returned for gallery image')
        return NextResponse.json(
          { error: 'No upload data returned for gallery image', details: 'Upload succeeded but no path returned' },
          { status: 500 }
        )
      }

      galleryImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sharelinks/${galleryUploadData.path}`
      console.log(`✅ Uploaded gallery image: ${galleryFileName} -> ${galleryImageUrl}`)
    } catch (error) {
      console.error('❌ Exception uploading gallery image:', error)
      return NextResponse.json(
        { error: 'Exception uploading gallery image', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // STEP 2: Create auth users FIRST to get their IDs
    console.log('🔐 Creating authentication users first...')
    const authResults = []
    const profilesToInsert = []

    for (const profile of uniqueProfiles) {
      // Generate default email if missing
      const defaultEmail = profile.email || `${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`
      
      // Generate default phone if missing
      const defaultPhone = profile.phone_number || '+27 81 234 5678'
      
      // Generate default website if missing
      const defaultWebsite = profile.website_url || `https://www.${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`
      
      // Generate default bio/address if missing
      const defaultBio = profile.address || `Located in ${profile.city || profile.business_location || 'South Africa'}. Providing quality ${profile.business_category.toLowerCase()} services to our community.`
      
      try {
        console.log(`🔐 Creating auth for user: ${profile.display_name} (${defaultEmail})`)
        
        let authData: any = null
        const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: defaultEmail,
          password: '123456', // Default password for all bulk uploaded users
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            display_name: profile.display_name,
            business_category: profile.business_category,
            bulk_uploaded: true
          }
        })

        if (authError) {
          // Check if it's a duplicate email error
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            console.log(`⚠️ User already exists: ${defaultEmail}, will try to get existing user...`)
            
            // Try to find the existing user by email in the profiles table
            const { data: existingProfile } = await supabaseAdmin
              .from('profiles')
              .select('id, display_name')
              .eq('email', defaultEmail)
              .single()
            
            if (existingProfile) {
              console.log(`✅ Found existing user: ${existingProfile.display_name} (${existingProfile.id})`)
              authResults.push({
                profile: profile.display_name,
                email: defaultEmail,
                success: true,
                userId: existingProfile.id,
                note: 'User already existed'
              })
              
              // Use the existing user's data
              authData = { user: { id: existingProfile.id, email: defaultEmail } }
            } else {
              console.error(`❌ User exists in auth but not in profiles table: ${defaultEmail}`)
              authResults.push({
                profile: profile.display_name,
                email: defaultEmail,
                success: false,
                error: 'User exists in auth but not in profiles'
              })
              continue
            }
          } else {
            console.error(`❌ Auth creation failed for ${profile.display_name}:`, authError.message)
            authResults.push({
              profile: profile.display_name,
              email: defaultEmail,
              success: false,
              error: authError.message
            })
            continue // Skip this profile if auth creation fails
          }
        } else {
          // Auth creation was successful
          authData = newAuthData
        }

        if (!authData || !authData.user) {
          console.error(`❌ No auth data available for ${profile.display_name}`)
          continue
        }

        console.log(`✅ Auth user ready for ${profile.display_name} with ID: ${authData.user.id}`)
        authResults.push({
          profile: profile.display_name,
          email: defaultEmail,
          success: true,
          userId: authData.user.id
        })

        // Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, subscription_tier')
          .eq('id', authData.user!.id)
          .single()

        if (existingProfile) {
          console.log(`⚠️ Profile already exists for ${profile.display_name}, will update with new tier: ${tier}`)
          // Update existing profile with new tier and other data
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: tier as 'free' | 'premium' | 'business',
              business_category: profile.business_category,
              business_location: profile.business_location || 'south-africa',
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id)
        }

        // STEP 2: Prepare profile with the auth user's ID
        profilesToInsert.push({
          id: authData.user.id, // Use the auth user's ID as the profile ID
          display_name: profile.display_name,
          email: defaultEmail,
          bio: defaultBio,
          phone_number: defaultPhone,
          website_url: defaultWebsite,
          business_category: profile.business_category,
          business_location: profile.business_location || 'south-africa',
          business_hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 2:00 PM',
          avatar_url: generateDefaultAvatar(profile.display_name),
          subscription_tier: tier as 'free' | 'premium' | 'business',
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
        })
      } catch (authErr) {
        console.error(`❌ Auth creation error for ${profile.display_name}:`, authErr)
        authResults.push({
          profile: profile.display_name,
          email: defaultEmail,
          success: false,
          error: authErr instanceof Error ? authErr.message : 'Unknown error'
        })
      }
    }

    const successfulAuth = authResults.filter(r => r.success).length
    const failedAuth = authResults.filter(r => !r.success)

    console.log(`🔐 Authentication results: ${successfulAuth} successful, ${failedAuth.length} failed`)

    if (profilesToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No profiles could be created - all auth creations failed', details: failedAuth },
        { status: 500 }
      )
    }

    console.log(`📝 Inserting ${profilesToInsert.length} profiles...`)
    console.log('📋 First profile to insert:', {
      id: profilesToInsert[0]?.id,
      display_name: profilesToInsert[0]?.display_name,
      subscription_tier: profilesToInsert[0]?.subscription_tier,
      business_category: profilesToInsert[0]?.business_category,
      email: profilesToInsert[0]?.email
    })

    // STEP 3: Insert profiles using admin client to bypass RLS (use upsert to handle duplicates)
    const { data: insertedProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilesToInsert, { onConflict: 'id' })
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

    // Get all profiles (both newly inserted and existing ones) for product creation
    const allProfilesForProducts = []
    
    // Add newly inserted profiles
    if (insertedProfiles && insertedProfiles.length > 0) {
      allProfilesForProducts.push(...insertedProfiles)
    }
    
    // Add existing profiles that were updated
    const successfulAuthUsers = authResults.filter(r => r.success)
    for (const authUser of successfulAuthUsers) {
      // Check if this profile is not already in insertedProfiles
      const alreadyIncluded = allProfilesForProducts.some(p => p.id === authUser.userId)
      if (!alreadyIncluded) {
        // Get the profile data for existing users
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, display_name, subscription_tier, business_category')
          .eq('id', authUser.userId)
          .single()
        
        if (existingProfile) {
          allProfilesForProducts.push(existingProfile)
        }
      }
    }

    console.log(`📊 Total profiles for product creation: ${allProfilesForProducts.length}`)
    console.log(`📊 Newly inserted: ${insertedProfiles?.length || 0}, Existing updated: ${allProfilesForProducts.length - (insertedProfiles?.length || 0)}`)

    if (allProfilesForProducts.length === 0) {
      console.log('⚠️ No profiles available for product creation')
      return NextResponse.json({
        success: false,
        message: 'No profiles available for product creation',
        results: {
          profilesCreated: 0,
          productsCreated: 0,
          galleryCreated: 0,
          locationsCreated: 0,
          authCreated: successfulAuth,
          authFailed: failedAuth.length,
          defaultPassword: '123456',
          errors: ['No profiles available for product creation'],
          renamedCount: 0
        }
      })
    }

    // Create default products for each profile
    const allProducts = []

    for (let i = 0; i < allProfilesForProducts.length; i++) {
      const profile = allProfilesForProducts[i]
      // Find the corresponding original profile by matching display_name
      const originalProfile = uniqueProfiles.find(up => up.display_name === profile.display_name)
      
      if (!originalProfile) {
        console.error(`❌ Could not find original profile for ${profile.display_name}`)
        continue
      }
      
      // Check if products already exist for this profile
      const { data: existingProducts } = await supabaseAdmin
        .from('profile_products')
        .select('id')
        .eq('profile_id', profile.id)
        .limit(1)
      
      if (existingProducts && existingProducts.length > 0) {
        console.log(`⚠️ Products already exist for ${profile.display_name}, skipping product creation`)
        continue
      }
      
      console.log(`🛍️ Creating products for profile: ${profile.display_name}`)
      console.log(`📂 Business category: "${originalProfile.business_category}"`)
      
      const defaultProducts = getDefaultProductsForCategory(originalProfile.business_category)
      console.log(`📦 Generated ${defaultProducts.length} products for category: ${originalProfile.business_category}`)
      
      const profileProducts = defaultProducts.map((product, productIndex) => ({
        id: crypto.randomUUID(),
        profile_id: profile.id,
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        currency: 'ZAR', // South African Rand
        category: originalProfile.business_category, // Use the actual category from CSV
        image_url: uploadedProductImages[productIndex] || null, // Use uploaded product image as main image
        is_active: true,
        images: uploadedProductImages[productIndex] ? [{ url: uploadedProductImages[productIndex], alt: product.name, order: 0 }] : null, // Images array with uploaded image
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

    // STEP 4: Create gallery images for each profile
    console.log('🖼️ Creating gallery images for profiles...')
    const allGalleryItems = []

    for (let i = 0; i < allProfilesForProducts.length; i++) {
      const profile = allProfilesForProducts[i]
      // Find the corresponding original profile by matching display_name
      const originalProfile = uniqueProfiles.find(up => up.display_name === profile.display_name)
      
      if (!originalProfile) {
        console.error(`❌ Could not find original profile for ${profile.display_name}`)
        continue
      }
      
      // Check if gallery already exists for this profile
      const { data: existingGallery } = await supabaseAdmin
        .from('profile_gallery')
        .select('id')
        .eq('profile_id', profile.id)
        .limit(1)
      
      if (existingGallery && existingGallery.length > 0) {
        console.log(`⚠️ Gallery already exists for ${profile.display_name}, skipping gallery creation`)
        continue
      }
      
      console.log(`🖼️ Creating gallery image for profile: ${profile.display_name}`)
      
      console.log(`🖼️ Gallery image URL: ${galleryImageUrl}`)
      
      const galleryItem = {
        id: crypto.randomUUID(),
        profile_id: profile.id,
        image_url: galleryImageUrl,
        caption: `${profile.display_name} - ${originalProfile.business_category}`,
        sort_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      allGalleryItems.push(galleryItem)
      console.log(`✅ Added gallery item for ${profile.display_name}`)
    }

    console.log(`🖼️ Total gallery items to insert: ${allGalleryItems.length}`)

    // Insert gallery items using admin client to bypass RLS
    const { data: insertedGallery, error: galleryError } = await supabaseAdmin
      .from('profile_gallery')
      .insert(allGalleryItems)
      .select('id')

    if (galleryError) {
      console.error('Gallery insertion error:', galleryError)
      return NextResponse.json(
        { error: 'Failed to insert gallery items', details: galleryError.message },
        { status: 500 }
      )
    }

    console.log('✅ Gallery items inserted successfully:', insertedGallery?.length || 0)

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
        galleryCreated: allGalleryItems.length,
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
