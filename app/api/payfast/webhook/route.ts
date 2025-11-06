import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import crypto from 'crypto'

// PayFast webhook handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data: Record<string, string> = {}
    
    // Convert FormData to object
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    console.log('PayFast webhook received:', data)

    // Verify PayFast signature (important for security)
    const isValidSignature = verifyPayFastSignature(data)
    if (!isValidSignature) {
      console.error('Invalid PayFast signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Extract payment information
    const {
      payment_status,
      m_payment_id, // This is our reference
      pf_payment_id, // PayFast payment ID
      amount_gross,
      custom_str1: profileId,
      custom_str2: tierRequested,
      custom_str3: transactionId,
      custom_str4: billingCycle
    } = data

    console.log('Payment details:', {
      payment_status,
      m_payment_id,
      pf_payment_id,
      amount_gross,
      profileId,
      tierRequested,
      transactionId,
      billingCycle
    })

    // Update payment transaction
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: payment_status === 'COMPLETE' ? 'paid' : 'failed',
        payfast_payment_id: pf_payment_id,
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // If payment is successful, activate subscription
    if (payment_status === 'COMPLETE') {
      try {
        // Call the activate_subscription function
        const { error: activationError } = await supabase
          .rpc('activate_subscription', {
            p_profile_id: profileId,
            p_tier: tierRequested,
            p_billing_cycle: billingCycle || 'monthly'
          })

        if (activationError) {
          console.error('Error activating subscription:', activationError)
          return NextResponse.json({ error: 'Subscription activation failed' }, { status: 500 })
        }

        console.log(`✅ Subscription activated for user ${profileId} - ${tierRequested} tier`)

        // Optional: Send confirmation email here
        // await sendSubscriptionConfirmationEmail(profileId, tierRequested)

      } catch (activationErr) {
        console.error('Subscription activation error:', activationErr)
        return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
      }
    } else {
      console.log(`❌ Payment failed for user ${profileId} - Status: ${payment_status}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayFast webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Verify PayFast signature for security
function verifyPayFastSignature(data: Record<string, string>): boolean {
  try {
    const { signature, ...paymentData } = data
    
    // PayFast merchant key (should be in environment variables)
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'
    
    // Create parameter string
    const paramString = Object.keys(paymentData)
      .sort()
      .map(key => `${key}=${encodeURIComponent(paymentData[key]).replace(/%20/g, '+')}`)
      .join('&')
    
    // Add merchant key
    const stringToHash = paramString + `&passphrase=${merchantKey}`
    
    // Generate signature
    const calculatedSignature = crypto
      .createHash('md5')
      .update(stringToHash)
      .digest('hex')
    
    return calculatedSignature === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Handle GET requests (PayFast sometimes sends GET for testing)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const data: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    data[key] = value
  })
  
  console.log('PayFast GET webhook:', data)
  
  return NextResponse.json({ 
    message: 'PayFast webhook endpoint active',
    method: 'GET',
    data 
  })
}
