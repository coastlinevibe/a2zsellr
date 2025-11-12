'use client'

import { useState } from 'react'
import { X, CreditCard, Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  selectedPlan: 'premium' | 'business'
  userProfile: any
}

export function PaymentMethodModal({ isOpen, onClose, onBack, selectedPlan, userProfile }: PaymentMethodModalProps) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const planDetails = {
    premium: { name: 'Premium', price: 149 },
    business: { name: 'Business', price: 299 }
  }

  const plan = planDetails[selectedPlan]

  const handlePayFastPayment = async () => {
    if (!userProfile || !user) return
    
    setIsProcessing(true)
    
    try {
      const amount = plan.price
      
      // Generate payment reference
      const reference = `${userProfile.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}_UPGRADE`
      
      // Create payment transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: userProfile.id,
          payment_method: 'payfast',
          amount_cents: amount * 100,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Update profile payment status for PayFast (different from EFT)
      await supabase
        .from('profiles')
        .update({
          payment_method: 'payfast',
          payment_reference: reference,
          payment_status: 'pending' // Will be updated to 'paid' by webhook
        })
        .eq('id', userProfile.id)

      // PayFast payment data (same as registration)
      const returnUrl = new URL(`${window.location.origin}/payment/success`)
      returnUrl.searchParams.set('method', 'payfast')
      returnUrl.searchParams.set('transaction_id', transaction.id)

      const paymentData = {
        merchant_id: "10000100", // Same as registration
        merchant_key: "46f0cd694581a", // Same as registration
        return_url: returnUrl.toString(),
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payfast/webhook`,
        
        amount: amount.toFixed(2),
        item_name: `${selectedPlan.toUpperCase()} Subscription Upgrade`,
        item_description: `A2Z ${selectedPlan} tier subscription upgrade`,
        
        name_first: userProfile.display_name || 'User',
        email_address: userProfile.email || user.email,
        
        custom_str1: userProfile.id,
        custom_str2: selectedPlan,
        custom_str3: transaction.id,
        custom_str4: 'monthly',
        
        m_payment_id: reference
      }

      // Create and submit PayFast form (same as registration)
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://sandbox.payfast.co.za/eng/process' // Same as registration
      
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      })
      
      document.body.appendChild(form)
      form.submit()

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleEFTPayment = async () => {
    if (!userProfile || !user) return
    
    setIsProcessing(true)
    
    try {
      const amount = plan.price
      
      // Generate payment reference
      const reference = `${userProfile.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}_UPGRADE`
      
      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: userProfile.id,
          payment_method: 'eft',
          amount_cents: amount * 100,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })

      if (transactionError) throw transactionError

      // Update profile payment status
      await supabase
        .from('profiles')
        .update({
          payment_method: 'eft',
          payment_reference: reference,
          payment_status: 'pending'
        })
        .eq('id', userProfile.id)

      // Show EFT payment instructions
      alert(`EFT Payment Instructions:
      
Bank: FNB
Account Name: A2Z Business Directory
Account Number: 1234567890
Branch Code: 250655
Reference: ${reference}
Amount: R${amount}

Please use the reference above and email proof of payment to payments@a2zsellr.life

Your account will be upgraded within 24 hours of payment verification.`)

      onClose()

    } catch (error) {
      console.error('EFT setup error:', error)
      alert('Failed to setup EFT payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-black">Choose Payment Method</h2>
              <p className="text-sm font-bold text-gray-600">
                {plan.name} Plan - R{plan.price}/month
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          {/* PayFast */}
          <button
            onClick={handlePayFastPayment}
            disabled={isProcessing}
            className="w-full p-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all bg-green-100 hover:bg-green-200 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-xl border-2 border-black">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-black text-black">PayFast (Instant Activation)</div>
                <div className="text-sm font-bold text-gray-600">
                  Cards, EFT, SnapScan, Zapper
                </div>
              </div>
            </div>
          </button>

          {/* EFT */}
          <button
            onClick={handleEFTPayment}
            disabled={isProcessing}
            className="w-full p-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-xl border-2 border-black">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-black text-black">Manual EFT (Admin Approval)</div>
                <div className="text-sm font-bold text-gray-600">
                  Bank transfer with proof of payment
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-600 mb-2">
              🔒 Secure payment processing
            </p>
            <p className="text-xs text-gray-500">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
