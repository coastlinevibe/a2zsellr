import { NextRequest, NextResponse } from 'next/server'
import { syncAllListingsCounts } from '@/lib/listingsSync'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting listings count sync...')
    
    const result = await syncAllListingsCounts()
    
    const message = `✅ Listings sync completed: ${result.success} profiles updated successfully, ${result.failed} failed`
    console.log(message)
    
    return NextResponse.json({
      success: true,
      message,
      data: result
    })
  } catch (error) {
    console.error('❌ Error syncing listings counts:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to sync listings counts',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}