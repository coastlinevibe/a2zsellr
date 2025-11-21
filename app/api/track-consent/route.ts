import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, listingId, consented, timestamp } = body

    // Validate required fields
    if (!businessName || !listingId || typeof consented !== 'boolean' || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user info from headers
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Save consent to Supabase
    const { data, error } = await supabase
      .from('message_consents')
      .insert({
        business_name: businessName,
        listing_id: listingId,
        consented,
        timestamp: new Date(timestamp).toISOString(),
        user_agent: userAgent,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save consent data' },
        { status: 500 }
      )
    }

    console.log('Message consent tracked successfully:', {
      businessName,
      listingId,
      consented,
      timestamp: new Date(timestamp).toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: 'Consent tracked successfully',
      data
    })

  } catch (error) {
    console.error('Error tracking consent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}