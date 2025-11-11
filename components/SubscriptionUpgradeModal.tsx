'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { 
  X, 
  Crown, 
  Sparkles, 
  Check, 
  CreditCard, 
  Shield, 
  Zap,
  Star,
  Users,
  BarChart3,
  Instagram,
  Palette,
  Headphones,
  Code,
  Loader2
} from 'lucide-react'

interface SubscriptionUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'free' | 'premium' | 'business'
  userProfile: any
  onUpgradeSuccess: (newTier: string) => void
}

interface PricingPlan {
  id: 'free' | 'premium' | 'business'
  name: string
  price: number
  interval: string
  description: string
  features: string[]
  icon: React.ReactNode
  gradient: string
  popular?: boolean
  disabled?: boolean
}

export function SubscriptionUpgradeModal({ 
  isOpen, 
  onClose, 
  currentTier, 
  userProfile,
  onUpgradeSuccess 
}: SubscriptionUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'business'>('premium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'eft'>('payfast')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: userProfile?.display_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone_number || '',
    company: userProfile?.display_name || ''
  })

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'forever',
      description: 'Perfect for getting started',
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-gray-400 to-gray-600',
      features: [
        '3 gallery images',
        '5 products (display only)',
        '3 shared listings',
        'Basic contact info',
        '7-day content reset'
      ],
      disabled: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      interval: 'month',
      description: 'Everything you need to grow',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-orange-400 to-red-500',
      popular: true,
      features: [
        '✨ Everything in Free',
        '🚫 No 7-day resets',
        '🖼️ Unlimited gallery images',
        '🛒 Full e-commerce shop',
        '🗺️ Google Maps integration',
        '💳 PayFast payment processing',
        '📱 WhatsApp marketing tools',
        '📘 Facebook campaign tools',
        '⭐ Premium directory placement'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 299,
      interval: 'month',
      description: 'Advanced features for enterprises',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-blue-500 to-purple-600',
      features: [
        '💎 Everything in Premium',
        '🏪 Multi-location management',
        '📊 Advanced analytics dashboard',
        '📸 Instagram ad automation',
        '🎨 Custom branding options',
        '🏆 Priority customer support',
        '🔌 API access & integrations',
        '🚀 Enterprise-level features'
      ]
    }
  ]

  const getAvailablePlans = () => {
    if (currentTier === 'free') {
      return plans.filter(p => p.id === 'premium' || p.id === 'business')
    } else if (currentTier === 'premium') {
      return plans.filter(p => p.id === 'business')
    }
    return []
  }

  const handlePlanSelect = (planId: 'premium' | 'business') => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handlePayFastPayment = async () => {
    setIsProcessing(true)
    
    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan)
      if (!selectedPlanData) throw new Error('Plan not found')

      // Generate payment reference
      const reference = `${userProfile.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}_UPGRADE`
      
      // Create payment transaction record (using existing table)
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: userProfile.id,
          payment_method: 'payfast',
          amount_cents: selectedPlanData.price * 100,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // PayFast payment data (using existing format)
      const returnUrl = new URL(`${window.location.origin}/payment/success`)
      returnUrl.searchParams.set('method', 'payfast')
      returnUrl.searchParams.set('transaction_id', transaction.id)

      const paymentData = {
        merchant_id: "10000100", // Same as registration
        merchant_key: "46f0cd694581a", // Same as registration
        return_url: returnUrl.toString(),
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payfast/webhook`,
        
        amount: selectedPlanData.price.toFixed(2),
        item_name: `${selectedPlanData.name.toUpperCase()} Subscription Upgrade`,
        item_description: `A2Z ${selectedPlan} tier subscription upgrade`,
        
        name_first: customerDetails.name.split(' ')[0] || '',
        name_last: customerDetails.name.split(' ').slice(1).join(' ') || '',
        email_address: customerDetails.email,
        
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
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEFTPayment = async () => {
    setIsProcessing(true)
    
    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan)
      if (!selectedPlanData) throw new Error('Plan not found')

      // Generate payment reference
      const reference = `${userProfile.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}_UPGRADE`
      
      // Create payment transaction record (using existing table)
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: userProfile.id,
          payment_method: 'eft',
          amount_cents: selectedPlanData.price * 100,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })

      if (transactionError) throw transactionError

      // Update profile payment status (same as registration)
      await supabase
        .from('profiles')
        .update({
          payment_method: 'eft',
          payment_reference: reference,
          payment_status: 'pending'
        })
        .eq('id', userProfile.id)

      // Show EFT payment instructions (same format as registration)
      alert(`EFT Payment Instructions:
      
Bank: FNB
Account Name: A2Z Business Directory
Account Number: 1234567890
Branch Code: 250655
Reference: ${reference}
Amount: R${selectedPlanData.price}

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

  const handleUpgrade = async () => {
    if (paymentMethod === 'payfast') {
      await handlePayFastPayment()
    } else {
      await handleEFTPayment()
    }
  }

  if (!isOpen) return null

  const availablePlans = getAvailablePlans()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-gray-600 mt-1">Unlock powerful features to grow your business</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showPaymentForm ? (
          /* Plan Selection */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                    plan.popular ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanSelect(plan.id as 'premium' | 'business')}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white mx-auto mb-3`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">R{plan.price}</span>
                      <span className="text-gray-600">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    Upgrade to {plan.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="p-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Complete Your Upgrade</h3>
                <p className="text-gray-600 mt-1">
                  Upgrading to {plans.find(p => p.id === selectedPlan)?.name} - R{plans.find(p => p.id === selectedPlan)?.price}/month
                </p>
              </div>

              {/* Customer Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+27 12 345 6789"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payfast"
                      checked={paymentMethod === 'payfast'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'payfast' | 'eft')}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Secure payment via PayFast</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="eft"
                      checked={paymentMethod === 'eft'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'payfast' | 'eft')}
                      className="mr-3"
                    />
                    <Shield className="w-5 h-5 mr-2 text-green-500" />
                    <div>
                      <div className="font-medium">EFT/Bank Transfer</div>
                      <div className="text-sm text-gray-600">Direct bank transfer</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={isProcessing || !customerDetails.name || !customerDetails.email}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Complete Upgrade
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
