import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret token
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting scheduled listings activation check...')

    // Get current time
    const now = new Date()

    // Find all scheduled listings where scheduled_for time has passed
    const { data: scheduledListings, error: fetchError } = await supabaseAdmin
      .from('profile_listings')
      .select('id, profile_id, title, scheduled_for, status')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled listings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled listings' },
        { status: 500 }
      )
    }

    if (!scheduledListings || scheduledListings.length === 0) {
      console.log('✅ No scheduled listings to activate')
      return NextResponse.json({
        success: true,
        message: 'No scheduled listings to activate',
        activated: 0
      })
    }

    console.log(`📋 Found ${scheduledListings.length} listings to activate`)

    // Activate each listing and send email
    let activatedCount = 0
    const errors: any[] = []

    for (const listing of scheduledListings) {
      try {
        // Update listing status to active
        const { error: updateError } = await supabaseAdmin
          .from('profile_listings')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', listing.id)

        if (updateError) {
          console.error(`Error updating listing ${listing.id}:`, updateError)
          errors.push({ listingId: listing.id, error: updateError.message })
          continue
        }

        // Get user profile for email
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('email, display_name')
          .eq('id', listing.profile_id)
          .single()

        if (profileError || !profile) {
          console.warn(`Could not find profile for listing ${listing.id}`)
          errors.push({ listingId: listing.id, error: 'Profile not found' })
          continue
        }

        // Send activation email
        try {
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-listing-activated-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: profile.email,
                displayName: profile.display_name,
                listingTitle: listing.title,
                listingId: listing.id
              }),
            }
          )

          if (emailResponse.ok) {
            console.log(`✅ Listing ${listing.id} activated and email sent to ${profile.email}`)
            activatedCount++
          } else {
            console.warn(`Email send failed for listing ${listing.id}`)
            errors.push({ listingId: listing.id, error: 'Email send failed' })
          }
        } catch (emailError) {
          console.warn(`Error sending email for listing ${listing.id}:`, emailError)
          errors.push({ listingId: listing.id, error: 'Email error' })
        }
      } catch (error) {
        console.error(`Error processing listing ${listing.id}:`, error)
        errors.push({ listingId: listing.id, error: String(error) })
      }
    }

    console.log(`🎉 Activation complete: ${activatedCount}/${scheduledListings.length} listings activated`)

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${activatedCount} listings`,
      activated: activatedCount,
      total: scheduledListings.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in activate-scheduled-listings cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
