import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify admin access via service role key in header
    const authHeader = request.headers.get('authorization')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!authHeader || !authHeader.includes(serviceRoleKey!)) {
      console.error('Unauthorized admin request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Manually triggering scheduled listings activation...')

    // Get current time
    const now = new Date()
    console.log(`Current time: ${now.toISOString()}`)

    // Find all scheduled listings where scheduled_for time has passed
    const { data: scheduledListings, error: fetchError } = await supabaseAdmin
      .from('profile_listings')
      .select('id, profile_id, title, scheduled_for, status')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now.toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled listings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled listings', details: fetchError },
        { status: 500 }
      )
    }

    console.log(`Found ${scheduledListings?.length || 0} listings to activate`)

    if (!scheduledListings || scheduledListings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled listings to activate',
        activated: 0,
        listings: []
      })
    }

    // Activate each listing and send email
    let activatedCount = 0
    const results: any[] = []
    const errors: any[] = []

    for (const listing of scheduledListings) {
      try {
        console.log(`Processing listing: ${listing.id} - ${listing.title}`)
        console.log(`  Scheduled for: ${listing.scheduled_for}`)
        console.log(`  Current time: ${now.toISOString()}`)
        console.log(`  Should activate: ${new Date(listing.scheduled_for) <= now}`)

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
          errors.push({ 
            listingId: listing.id, 
            title: listing.title,
            error: updateError.message 
          })
          continue
        }

        console.log(`✅ Updated listing ${listing.id} to active`)

        // Get user profile for email
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('email, display_name')
          .eq('id', listing.profile_id)
          .single()

        if (profileError || !profile) {
          console.warn(`Could not find profile for listing ${listing.id}`)
          errors.push({ 
            listingId: listing.id, 
            title: listing.title,
            error: 'Profile not found' 
          })
          continue
        }

        console.log(`Sending email to: ${profile.email}`)

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
            console.log(`✅ Email sent for listing ${listing.id}`)
            activatedCount++
            results.push({
              listingId: listing.id,
              title: listing.title,
              email: profile.email,
              status: 'activated'
            })
          } else {
            const errorText = await emailResponse.text()
            console.warn(`Email send failed for listing ${listing.id}: ${errorText}`)
            errors.push({ 
              listingId: listing.id, 
              title: listing.title,
              error: 'Email send failed' 
            })
          }
        } catch (emailError) {
          console.warn(`Error sending email for listing ${listing.id}:`, emailError)
          errors.push({ 
            listingId: listing.id, 
            title: listing.title,
            error: String(emailError) 
          })
        }
      } catch (error) {
        console.error(`Error processing listing ${listing.id}:`, error)
        errors.push({ 
          listingId: listing.id, 
          title: listing.title,
          error: String(error) 
        })
      }
    }

    console.log(`🎉 Activation complete: ${activatedCount}/${scheduledListings.length} listings activated`)

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${activatedCount} listings`,
      activated: activatedCount,
      total: scheduledListings.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in trigger listing activation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
