import { NextRequest, NextResponse } from 'next/server'

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

    // Here you would typically save this to your database
    // For now, we'll just log it and return success
    console.log('Message consent tracked:', {
      businessName,
      listingId,
      consented,
      timestamp: new Date(timestamp).toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // TODO: Save to database
    // Example:
    // await supabase
    //   .from('message_consents')
    //   .insert({
    //     business_name: businessName,
    //     listing_id: listingId,
    //     consented,
    //     timestamp: new Date(timestamp).toISOString(),
    //     user_agent: request.headers.get('user-agent'),
    //     ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    //   })

    return NextResponse.json({ 
      success: true,
      message: 'Consent tracked successfully'
    })

  } catch (error) {
    console.error('Error tracking consent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}