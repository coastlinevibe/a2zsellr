import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// API endpoint to track profile views - accessible to anonymous users
export async function POST(request: NextRequest) {
  try {
    const { profileId, type = 'view' } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Use service role client to bypass RLS for analytics tracking
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if today's analytics record exists
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('profile_analytics')
      .select('views, clicks')
      .eq('profile_id', profileId)
      .eq('date', today)
      .single()

    if (existing && !selectError) {
      // Update today's record
      const updateData = type === 'click' 
        ? { clicks: existing.clicks + 1 }
        : { views: existing.views + 1 }

      const { error: updateError } = await supabaseAdmin
        .from('profile_analytics')
        .update(updateData)
        .eq('profile_id', profileId)
        .eq('date', today)

      if (updateError) {
        console.error('Error updating analytics:', updateError)
        return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
      }
    } else {
      // Insert new record for today
      const insertData = {
        profile_id: profileId,
        date: today,
        views: type === 'view' ? 1 : 0,
        clicks: type === 'click' ? 1 : 0,
        orders: 0,
        revenue_cents: 0,
        new_customers: 0,
        returning_customers: 0
      }

      const { error: insertError } = await supabaseAdmin
        .from('profile_analytics')
        .insert(insertData)

      if (insertError) {
        console.error('Error inserting analytics:', insertError)
        return NextResponse.json({ error: 'Failed to insert analytics' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
