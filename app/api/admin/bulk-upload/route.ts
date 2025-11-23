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
    const uploadMode = (formData.get('uploadMode') as string) || 'manual'

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    let productImages: File[] = []
    let galleryImages: File[] = []
    let uploadedProductImages: string[] = []
    let uploadedGalleryImages: string[] = []

    if (uploadMode === 'manual') {
      // Get uploaded images for manual mode
      for (let i = 0; i < 10; i++) {
        const image = formData.get(`productImage${i}`) as File
        if (image) {
          productImages.push(image)
        }
      }
      
      // Get gallery images
      const galleryImageCount = parseInt(formData.get('galleryImageCount') as string) || 0
      for (let i = 0; i < galleryImageCount; i++) {
        const image = formData.get(`galleryImage${i}`) as File
        if (image) {
          galleryImages.push(image)
        }
      }

      if (productImages.length !== 10) {
        return NextResponse.json(
          { error: 'Exactly 10 product images are required for manual mode' },
          { status: 400 }
        )
      }

      if (galleryImages.length === 0) {
        return NextResponse.json(
          { error: 'At least 1 gallery image is required for manual mode' },
          { status: 400 }
        )
      }

      if (galleryImages.length > 30) {
        return NextResponse.json(
          { error: 'Maximum 30 gallery images allowed' },
          { status: 400 }
        )
      }
    }

    console.log('🚀 [UPLOAD API] Starting bulk upload process...')
    console.log(`📊 [UPLOAD API] Bulk upload with tier: ${tier}`)
    console.log(`🤖 [UPLOAD API] Upload mode: ${uploadMode}`)
    console.log(`📸 [UPLOAD API] Product images: ${uploadMode === 'manual' ? productImages.length : 'Auto-generated'}`)
    console.log(`🖼️ [UPLOAD API] Gallery images: ${uploadMode === 'manual' ? galleryImages.length : 'Auto-generated'}`)
    console.log(`🔑 [UPLOAD API] Service role key available: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    console.log(`🌐 [UPLOAD API] Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

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

    // STEP 1: Handle images based on upload mode
    if (uploadMode === 'manual') {
      console.log('📸 Manual mode: Uploading user-provided images to storage...')
      
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
          .from('gallery')
          .list('', { limit: 1 })
        
        if (galleryBucketError) {
          console.error('❌ Cannot access gallery bucket:', galleryBucketError)
          return NextResponse.json(
            { error: 'Cannot access gallery storage bucket', details: galleryBucketError.message },
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

      // Upload product images
      for (let i = 0; i < productImages.length; i++) {
        const image = productImages[i]
        const fileName = `bulk-upload/${Date.now()}-${Math.random().toString(36).substring(7)}.${image.name.split('.').pop()}`
        
        try {
          console.log(`📸 Uploading product image ${i + 1}: ${fileName} (${image.size} bytes)`)
          
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(fileName, image, {
              cacheControl: '3600',
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

          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(fileName)
          
          const imageUrl = publicUrl
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

      // Upload gallery images
      for (let i = 0; i < galleryImages.length; i++) {
        const galleryImage = galleryImages[i]
        const galleryFileName = `bulk-upload/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${galleryImage.name.split('.').pop()}`
        
        try {
          console.log(`🖼️ Uploading gallery image ${i + 1}: ${galleryFileName} (${galleryImage.size} bytes)`)
          
          const { data: galleryUploadData, error: galleryUploadError } = await supabaseAdmin.storage
            .from('gallery')
            .upload(galleryFileName, galleryImage, {
              cacheControl: '3600',
              upsert: false
            })

          if (galleryUploadError) {
            console.error(`❌ Failed to upload gallery image ${i + 1}:`, galleryUploadError)
            return NextResponse.json(
              { error: `Failed to upload gallery image ${i + 1}`, details: galleryUploadError.message },
              { status: 500 }
            )
          }

          if (!galleryUploadData || !galleryUploadData.path) {
            console.error(`❌ No upload data returned for gallery image ${i + 1}`)
            return NextResponse.json(
              { error: `No upload data returned for gallery image ${i + 1}`, details: 'Upload succeeded but no path returned' },
              { status: 500 }
            )
          }

          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('gallery')
            .getPublicUrl(galleryFileName)
          
          uploadedGalleryImages.push(publicUrl)
          console.log(`✅ Uploaded gallery image ${i + 1}: ${galleryFileName} -> ${publicUrl}`)
        } catch (error) {
          console.error(`❌ Exception uploading gallery image ${i + 1}:`, error)
          return NextResponse.json(
            { error: `Exception uploading gallery image ${i + 1}`, details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        }
      }
    } else {
      // Auto mode: No images will be imported - users will add their own
      console.log('🤖 Auto mode: No images will be imported - users will add their own')
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
      
      // Generate default bio if missing
      const defaultBio = `Located in ${profile.city || profile.business_location || 'South Africa'}. Providing quality ${profile.business_category.toLowerCase()} services to our community.`
      
      // Use address from CSV for address field
      const profileAddress = profile.address || ''
      
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
        const finalBusinessLocation = profile.business_location || 'south-africa'
        
        console.log(`🔍 Profile ${profile.display_name} business_location:`, {
          originalBusinessLocation: profile.business_location,
          finalBusinessLocation: finalBusinessLocation
        })
        
        profilesToInsert.push({
          id: authData.user.id, // Use the auth user's ID as the profile ID
          display_name: profile.display_name,
          email: defaultEmail,
          bio: defaultBio,
          address: profileAddress, // CSV address goes to address column
          phone_number: defaultPhone,
          website_url: defaultWebsite,
          business_category: profile.business_category,
          business_location: finalBusinessLocation,
          business_hours: JSON.stringify({
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '14:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
          }),
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
      
      const profileProducts = defaultProducts.map((product, productIndex) => {
        // Format product details with line breaks instead of commas
        const formattedDetails = product.details 
          ? product.details.split(',').map(detail => detail.trim()).join('\n')
          : null;

        // Don't import images - users will add their own
        const productImageUrl = null;

        return {
          id: crypto.randomUUID(),
          profile_id: profile.id,
          name: product.name,
          description: product.description,
          price_cents: product.price_cents,
          currency: 'ZAR', // South African Rand
          category: originalProfile.business_category, // Use the actual category from CSV
          image_url: productImageUrl,
          is_active: true,
          images: null,
          product_details: formattedDetails,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      })
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

    // STEP 4.5: Create product tags for each product
    console.log('🏷️ Creating product tags...')
    const allProductTags: any[] = []
    const allProductTagAssignments: any[] = []

    for (let i = 0; i < allProfilesForProducts.length; i++) {
      const profile = allProfilesForProducts[i]
      const originalProfile = uniqueProfiles.find(up => up.display_name === profile.display_name)
      
      if (!originalProfile) continue;
      
      const defaultProducts = getDefaultProductsForCategory(originalProfile.business_category)
      const profileProductsFromDB = insertedProducts?.slice(i * 10, (i + 1) * 10) || []
      
      for (let j = 0; j < Math.min(defaultProducts.length, profileProductsFromDB.length); j++) {
        const product = defaultProducts[j]
        const dbProduct = profileProductsFromDB[j]
        
        if (!dbProduct) continue;
        
        // Create standard tags for each product
        const productTags = [
          {
            id: crypto.randomUUID(),
            name: 'Featured',
            icon: '⭐',
            color: '#10B981',
            is_system_tag: true,
            category: 'status',
            created_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: originalProfile.business_category.charAt(0).toUpperCase() + originalProfile.business_category.slice(1).replace(/-/g, ' '),
            icon: '🏷️',
            color: '#3B82F6',
            is_system_tag: true,
            category: 'business_category',
            created_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Popular',
            icon: '🔥',
            color: '#F59E0B',
            is_system_tag: true,
            category: 'status',
            created_at: new Date().toISOString()
          }
        ]
        
        allProductTags.push(...productTags)
        
        // Create tag assignments
        productTags.forEach(tag => {
          allProductTagAssignments.push({
            product_id: dbProduct.id,
            tag_id: tag.id,
            created_at: new Date().toISOString()
          })
        })
      }
    }

    // Insert product tags
    if (allProductTags.length > 0) {
      const { error: tagsError } = await supabaseAdmin
        .from('product_tags')
        .upsert(allProductTags, { onConflict: 'id' })

      if (tagsError) {
        console.error('❌ Failed to insert product tags:', tagsError)
      } else {
        console.log(`✅ Inserted ${allProductTags.length} product tags`)
      }

      // Insert product tag assignments
      const { error: assignmentsError } = await supabaseAdmin
        .from('product_tag_assignments')
        .upsert(allProductTagAssignments, { onConflict: 'product_id,tag_id' })

      if (assignmentsError) {
        console.error('❌ Failed to insert product tag assignments:', assignmentsError)
      } else {
        console.log(`✅ Inserted ${allProductTagAssignments.length} product tag assignments`)
      }
    }

    // STEP 5: Skip gallery creation - users will add their own images
    console.log('🖼️ Skipping gallery creation - users will add their own images')
    const insertedGallery = [] // Empty array for response

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
        galleryCreated: 0, // No gallery items created - users add their own
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
