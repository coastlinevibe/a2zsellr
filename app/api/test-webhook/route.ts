import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Test webhook to manually activate subscription
export async function POST(request: NextRequest) {
  try {
    const { profileId, tierRequested } = await request.json()
    
    console.log(`🧪 TEST: Activating subscription for user ${profileId} - ${tierRequested} tier`)
    
    if (!profileId) {
      return NextResponse.json({ error: 'No profile ID provided' }, { status: 400 })
    }
    
    if (!tierRequested) {
      return NextResponse.json({ error: 'No tier requested' }, { status: 400 })
    }
    
    // Check if profile exists first
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, display_name, email, subscription_tier')
      .eq('id', profileId)
      .single()
    
    if (checkError || !existingProfile) {
      console.error('❌ Profile not found:', checkError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    console.log('👤 Found profile:', existingProfile)
    
    // Update profile
    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tierRequested,
        subscription_status: 'active',
        trial_end_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()

    if (profileUpdateError) {
      console.error('❌ Error updating profile:', profileUpdateError)
      return NextResponse.json({ error: 'Profile update failed' }, { status: 500 })
    }

    console.log('✅ Profile updated successfully:', updatedProfile)
    
    return NextResponse.json({ 
      success: true, 
      message: `Subscription activated for ${existingProfile.display_name}`,
      before: existingProfile,
      after: updatedProfile[0]
    })

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}

// GET endpoint to test if the API is working
export async function GET() {
  return NextResponse.json({ 
    message: 'Test webhook endpoint is active',
    usage: 'POST with { "profileId": "uuid", "tierRequested": "premium" }'
  })
}