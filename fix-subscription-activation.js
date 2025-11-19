// Fix subscription activation for pending premium payments
// This script will manually activate subscriptions for users who have paid but aren't upgraded

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixPendingSubscriptions() {
  try {
    console.log('🔍 Looking for pending premium/business payments...')
    
    // Get all pending payments from admin_payment_overview
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('admin_payment_overview')
      .select('*')
      .eq('status', 'pending')
      .in('tier_requested', ['premium', 'business'])
    
    if (paymentsError) {
      console.error('❌ Error fetching pending payments:', paymentsError)
      return
    }
    
    console.log(`📋 Found ${pendingPayments?.length || 0} pending payments`)
    
    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('✅ No pending payments to process')
      return
    }
    
    // Process each pending payment
    for (const payment of pendingPayments) {
      console.log(`\n🔄 Processing payment for ${payment.display_name} (${payment.email})`)
      console.log(`   Tier: ${payment.tier_requested}`)
      console.log(`   Amount: R${payment.amount_cents / 100}`)
      
      try {
        // Check current user profile
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email, subscription_tier, subscription_status')
          .eq('id', payment.profile_id)
          .single()
        
        if (profileError) {
          console.error(`   ❌ Error fetching profile: ${profileError.message}`)
          continue
        }
        
        console.log(`   Current tier: ${currentProfile.subscription_tier}`)
        
        // If user is already on the requested tier, skip
        if (currentProfile.subscription_tier === payment.tier_requested) {
          console.log(`   ✅ User already has ${payment.tier_requested} tier`)
          
          // Update payment status to paid
          await supabase
            .from('admin_payment_overview')
            .update({ 
              status: 'paid',
              payment_date: new Date().toISOString()
            })
            .eq('id', payment.id)
          
          continue
        }
        
        // Activate subscription using the database function
        console.log(`   🚀 Activating ${payment.tier_requested} subscription...`)
        
        const { error: activationError } = await supabase
          .rpc('activate_subscription', {
            p_profile_id: payment.profile_id,
            p_tier: payment.tier_requested,
            p_billing_cycle: 'monthly'
          })
        
        if (activationError) {
          console.error(`   ❌ Activation error: ${activationError.message}`)
          
          // Try manual update as fallback
          console.log(`   🔄 Trying manual profile update...`)
          
          const { error: manualError } = await supabase
            .from('profiles')
            .update({
              subscription_tier: payment.tier_requested,
              subscription_status: 'active',
              trial_end_date: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.profile_id)
          
          if (manualError) {
            console.error(`   ❌ Manual update failed: ${manualError.message}`)
            continue
          }
          
          console.log(`   ✅ Manual profile update successful`)
        } else {
          console.log(`   ✅ Subscription activated via function`)
        }
        
        // Update payment status to paid
        const { error: paymentUpdateError } = await supabase
          .from('admin_payment_overview')
          .update({ 
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', payment.id)
        
        if (paymentUpdateError) {
          console.error(`   ⚠️ Payment status update failed: ${paymentUpdateError.message}`)
        } else {
          console.log(`   ✅ Payment status updated to 'paid'`)
        }
        
        console.log(`   🎉 Successfully activated ${payment.tier_requested} for ${payment.display_name}`)
        
      } catch (error) {
        console.error(`   ❌ Error processing payment for ${payment.display_name}:`, error)
      }
    }
    
    console.log('\n🎯 Subscription activation complete!')
    
    // Show summary
    const { data: updatedPayments } = await supabase
      .from('admin_payment_overview')
      .select('status, tier_requested')
      .in('tier_requested', ['premium', 'business'])
    
    const paidCount = updatedPayments?.filter(p => p.status === 'paid').length || 0
    const pendingCount = updatedPayments?.filter(p => p.status === 'pending').length || 0
    
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Paid subscriptions: ${paidCount}`)
    console.log(`   ⏳ Still pending: ${pendingCount}`)
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the fix
fixPendingSubscriptions()