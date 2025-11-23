import { NextRequest, NextResponse } from 'next/server'
import { parseBulkUploadCSV, validateProfileData } from '@/lib/bulkUploadUtils'
import { getDefaultProductsForCategory } from '@/lib/defaultProducts'

export async function POST(request: NextRequest) {
  console.log('🚀 [PREVIEW API] Starting bulk upload preview...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadMode = (formData.get('uploadMode') as string) || 'manual'

    console.log(`📋 [PREVIEW API] Upload mode: ${uploadMode}`)
    console.log(`📁 [PREVIEW API] File received: ${file?.name || 'No file'} (${file?.size || 0} bytes)`)

    if (!file) {
      console.error('❌ [PREVIEW API] No file provided')
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Parse CSV file
    console.log('📄 [PREVIEW API] Reading CSV file...')
    const csvText = await file.text()
    console.log(`📄 [PREVIEW API] CSV content length: ${csvText.length} characters`)
    console.log(`📄 [PREVIEW API] CSV preview: ${csvText.substring(0, 200)}...`)
    
    console.log('🔍 [PREVIEW API] Parsing CSV data...')
    const profilesData = await parseBulkUploadCSV(csvText)
    console.log(`📊 [PREVIEW API] Parsed ${profilesData.length} profiles from CSV`)

    if (profilesData.length === 0) {
      console.error('❌ [PREVIEW API] No profiles found in CSV')
      return NextResponse.json(
        { error: 'No valid profiles found in CSV' },
        { status: 400 }
      )
    }

    // Validate data
    console.log('✅ [PREVIEW API] Validating profile data...')
    const validationResults = await validateProfileData(profilesData)
    const validProfiles = validationResults.valid
    console.log(`✅ [PREVIEW API] Validation complete: ${validProfiles.length} valid profiles, ${validationResults.errors.length} errors`)

    if (validProfiles.length === 0) {
      console.error('❌ [PREVIEW API] No valid profiles after validation')
      console.error('❌ [PREVIEW API] Validation errors:', validationResults.errors)
      return NextResponse.json(
        { error: 'No valid profiles after validation' },
        { status: 400 }
      )
    }

    // Calculate expected products (10 per profile)
    const expectedProducts = validProfiles.length * 10

    // Get unique categories and their products for auto mode
    const categoryProductsMap = new Map<string, any[]>()
    const categoryCounts = new Map<string, number>()

    if (uploadMode === 'auto') {
      console.log('🤖 [PREVIEW API] Auto mode: Processing categories...')
      
      validProfiles.forEach((profile, index) => {
        const category = profile.business_category
        console.log(`📂 [PREVIEW API] Profile ${index + 1}: "${profile.display_name}" -> Category: "${category}"`)
        
        if (!categoryProductsMap.has(category)) {
          console.log(`🔍 [PREVIEW API] Getting products for new category: "${category}"`)
          const products = getDefaultProductsForCategory(category)
          console.log(`📦 [PREVIEW API] Found ${products.length} products for category: "${category}"`)
          console.log(`📦 [PREVIEW API] First product: ${products[0]?.name || 'No products'}`)
          categoryProductsMap.set(category, products)
        }
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
      })
      
      console.log(`🎯 [PREVIEW API] Categories processed: ${categoryProductsMap.size} unique categories`)
      console.log(`🎯 [PREVIEW API] Category breakdown:`, Array.from(categoryCounts.entries()))
    }

    // Convert maps to arrays for response
    console.log('🔄 [PREVIEW API] Converting data for response...')
    const categoryProducts = Array.from(categoryProductsMap.entries()).map(([category, products]) => {
      console.log(`🔄 [PREVIEW API] Processing category "${category}" with ${products.length} products`)
      return {
        category,
        count: categoryCounts.get(category) || 0,
        products: products.map(p => ({
          name: p.name,
          description: p.description,
          price: `R${(p.price_cents / 100).toFixed(2)}`,
          price_cents: p.price_cents,
          details: p.details ? p.details.split(',').map((detail: string) => detail.trim()).join('\n') : p.details,
          image_url: p.image_url,
          tags: [
            { name: 'Featured', color: '#10B981', icon: '⭐' },
            { name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '), color: '#3B82F6', icon: '🏷️' },
            { name: 'Popular', color: '#F59E0B', icon: '🔥' }
          ]
        }))
      }
    })

    console.log('✅ [PREVIEW API] Preview data prepared successfully')
    console.log(`✅ [PREVIEW API] Response summary: ${validProfiles.length} profiles, ${expectedProducts} expected products, ${categoryProducts.length} categories`)

    return NextResponse.json({
      success: true,
      preview: {
        totalCount: validProfiles.length,
        expectedProducts: expectedProducts,
        uploadMode: uploadMode,
        categoryProducts: uploadMode === 'auto' ? categoryProducts : undefined,
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
    console.error('❌ [PREVIEW API] Critical error:', error)
    console.error('❌ [PREVIEW API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}