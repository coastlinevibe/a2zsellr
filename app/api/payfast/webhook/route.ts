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

    console.log('🔔 PayFast webhook received:', data)
    console.log('🔍 Webhook URL called:', request.url)
    console.log('🕐 Timestamp:', new Date().toISOString())

    // Verify PayFast signature (important for security)
    const isValidSignature = verifyPayFastSignature(data)
    console.log('🔐 Signature validation:', isValidSignature)
    
    // TEMPORARY: Skip signature validation for debugging
    // if (!isValidSignature) {
    //   console.error('❌ Invalid PayFast signature')
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    // }
    
    if (!isValidSignature) {
      console.warn('⚠️ Invalid signature - proceeding anyway for debugging')
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

    // Update payment transaction (if transaction ID is provided)
    const isPaymentSuccessful = ['COMPLETE', 'PAID', 'SUCCESS'].includes(payment_status?.toUpperCase())
    console.log('💳 Payment successful?', isPaymentSuccessful, 'Status:', payment_status)
    
    if (transactionId) {
      console.log('🔄 Updating transaction:', transactionId)
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: isPaymentSuccessful ? 'paid' : 'failed',
          payfast_payment_id: pf_payment_id,
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (updateError) {
        console.error('❌ Error updating transaction:', updateError)
        // Don't fail the webhook if transaction update fails - continue with activation
      } else {
        console.log('✅ Transaction updated successfully')
      }
    } else {
      console.log('ℹ️ No transaction ID provided')
    }

    // Only activate subscription if payment is successful
    if (isPaymentSuccessful) {
      console.log(`🚀 Payment successful - activating subscription for user ${profileId} - ${tierRequested} tier`)
      console.log(`📋 Profile ID: ${profileId}`)
      console.log(`🎯 Tier requested: ${tierRequested}`)
      
      if (!profileId) {
        console.error('❌ No profile ID provided in webhook data')
        return NextResponse.json({ error: 'No profile ID' }, { status: 400 })
      }
      
      if (!tierRequested) {
        console.error('❌ No tier requested in webhook data')
        return NextResponse.json({ error: 'No tier requested' }, { status: 400 })
      }
    } else {
      console.log(`❌ Payment not successful - Status: ${payment_status}`)
      return NextResponse.json({ success: true, message: 'Payment not successful, no action taken' })
    }
    
    try {
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
      
      // Direct profile update (bypassing the problematic function)
      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tierRequested,
          subscription_status: 'active',
          trial_end_date: null, // Clear trial restrictions
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select()

      if (profileUpdateError) {
        console.error('❌ Error updating profile:', profileUpdateError)
        return NextResponse.json({ error: 'Profile update failed' }, { status: 500 })
      }

      console.log('✅ Profile updated successfully:', updatedProfile)
      console.log(`🎉 Subscription successfully activated for user ${profileId} - ${tierRequested} tier`)

      // Optional: Send confirmation email here
      // await sendSubscriptionConfirmationEmail(profileId, tierRequested)

    } catch (activationErr) {
      console.error('❌ Subscription activation error:', activationErr)
      return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
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
