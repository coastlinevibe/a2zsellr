import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// API endpoint to process pending PayFast payments
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing pending PayFast payments...')
    
    // Get all pending PayFast payments
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('admin_payment_overview')
      .select('*')
      .eq('payment_method', 'payfast')
      .eq('status', 'pending')
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
    
    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending PayFast payments found',
        processed: 0
      })
    }
    
    console.log(`📋 Found ${pendingPayments.length} pending PayFast payments`)
    
    const results = []
    let successCount = 0
    let errorCount = 0
    
    // Process each payment
    for (const payment of pendingPayments) {
      try {
        console.log(`🔄 Processing ${payment.display_name} - ${payment.tier_requested}`)
        
        // Update profile to premium/business
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: payment.tier_requested,
            subscription_status: 'active',
            trial_end_date: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.profile_id)
        
        if (profileError) {
          console.error(`❌ Profile update failed for ${payment.display_name}:`, profileError)
          results.push({
            user: payment.display_name,
            email: payment.email,
            tier: payment.tier_requested,
            success: false,
            error: profileError.message
          })
          errorCount++
        } else {
          console.log(`✅ ${payment.display_name} upgraded to ${payment.tier_requested}`)
          results.push({
            user: payment.display_name,
            email: payment.email,
            tier: payment.tier_requested,
            success: true
          })
          successCount++
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${payment.display_name}:`, error)
        results.push({
          user: payment.display_name,
          email: payment.email,
          tier: payment.tier_requested,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }
    
    console.log(`🎉 Processing complete: ${successCount} success, ${errorCount} errors`)
    
    return NextResponse.json({
      success: true,
      message: `Processed ${pendingPayments.length} PayFast payments`,
      processed: successCount,
      errors: errorCount,
      results
    })
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check pending payments
export async function GET() {
  try {
    const { data: pendingPayments, error } = await supabase
      .from('admin_payment_overview')
      .select('display_name, email, tier_requested, amount_cents, created_at')
      .eq('payment_method', 'payfast')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
    
    return NextResponse.json({
      pending_count: pendingPayments?.length || 0,
      payments: pendingPayments || []
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'API error' }, { status: 500 })
  }
}