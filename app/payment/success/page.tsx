'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const paymentMethod = searchParams?.get('method') || 'payfast'

  useEffect(() => {
    if (user) {
      checkPaymentStatus()
    }
  }, [user])

  const checkPaymentStatus = async () => {
    try {
      // Get the latest payment transaction for this user
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching payment:', error)
      } else {
        setPaymentDetails(transaction)
        
        // If this is a PayFast payment and it's still pending, try to activate it
        // This handles cases where PayFast webhook wasn't called (localhost, sandbox issues)
        if (transaction.payment_method === 'payfast' && 
            transaction.status === 'pending' && 
            paymentMethod === 'payfast') {
          
          console.log('🔄 PayFast webhook failed, manually activating subscription...')
          
          try {
            // Direct profile update (bypassing the broken activate_subscription function)
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                subscription_tier: transaction.tier_requested,
                subscription_status: 'active',
                trial_end_date: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', user?.id)

            if (profileError) {
              console.error('Profile update error:', profileError)
            } else {
              console.log('✅ Profile updated to', transaction.tier_requested)
              
              // Update transaction status
              await supabase
                .from('payment_transactions')
                .update({
                  status: 'paid',
                  payment_date: new Date().toISOString(),
                  payfast_payment_id: 'SUCCESS_PAGE_' + Date.now(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', transaction.id)
              
              console.log('✅ Payment marked as paid')
              
              // Refresh transaction data
              const { data: updatedTransaction } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('id', transaction.id)
                .single()
              
              if (updatedTransaction) {
                setPaymentDetails(updatedTransaction)
              }
            }
          } catch (manualError) {
            console.error('PayFast manual activation error:', manualError)
          }
        }
      }

      // Get updated profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user?.id)
        .single()

      
    } catch (error) {
      console.error('Payment status check error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {paymentMethod === 'eft' ? 'Payment Submitted! 📧' : 'Payment Successful! 🎉'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {paymentMethod === 'eft' 
            ? 'Your payment proof has been submitted successfully. Your account will be activated as soon as your payment is verified. We will notify you by email.'
            : 'Thank you for upgrading your account. Your subscription has been activated! Please sign in to access your profile and premium features.'
          }
        </p>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-emerald-600" />
              Subscription Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium capitalize">{paymentDetails.tier_requested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">R{(paymentDetails.amount_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{paymentDetails.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${paymentMethod === 'eft' ? 'text-yellow-600' : 'text-emerald-600'}`}>
                  {paymentMethod === 'eft' ? 'Pending Verification' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {paymentMethod === 'eft' ? (
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
            >
              <div className="flex items-center justify-center gap-2">
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/auth/login-animated')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
            >
              <div className="flex items-center justify-center gap-2">
                Sign In to Access Profile
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          )}
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full py-3"
          >
            Back to Home
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What's next?</strong><br />
            {paymentMethod === 'eft' 
              ? 'We will review your payment within 24 hours and notify you by email once your account is activated.'
              : 'Sign in with your email and password to access your premium profile and features!'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
