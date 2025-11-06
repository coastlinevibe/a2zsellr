'use client'

import { useState } from 'react'
import { Crown, Zap, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentModal } from './PaymentModal'

interface SubscriptionUpgradeProps {
  currentTier: 'free' | 'premium' | 'business'
  onUpgrade?: () => void
}

export function SubscriptionUpgrade({ currentTier, onUpgrade }: SubscriptionUpgradeProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'premium' | 'business'>('premium')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const tiers = {
    premium: {
      name: 'Premium',
      icon: Star,
      color: 'purple',
      monthlyPrice: 99,
      annualPrice: 1069.20,
      features: [
        'Unlimited gallery images',
        'Advanced analytics',
        'Priority support',
        'Custom business hours',
        'Social media integration',
        'Email marketing tools'
      ]
    },
    business: {
      name: 'Business',
      icon: Crown,
      color: 'emerald',
      monthlyPrice: 299,
      annualPrice: 3238.92,
      features: [
        'Everything in Premium',
        'Unlimited products/services',
        'Advanced shop features',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'White-label options'
      ]
    }
  }

  const handleUpgrade = (tier: 'premium' | 'business') => {
    setSelectedTier(tier)
    setShowPaymentModal(true)
  }

  const getPrice = (tier: 'premium' | 'business', cycle: 'monthly' | 'annual') => {
    return cycle === 'monthly' ? tiers[tier].monthlyPrice : tiers[tier].annualPrice
  }

  const getSavings = (tier: 'premium' | 'business') => {
    const monthly = tiers[tier].monthlyPrice * 12
    const annual = tiers[tier].annualPrice
    return ((monthly - annual) / monthly * 100).toFixed(0)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upgrade Your Business
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock powerful features to grow your business and reach more customers
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Save {getSavings('premium')}%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {Object.entries(tiers).map(([tierKey, tier]) => {
          const tierType = tierKey as 'premium' | 'business'
          const Icon = tier.icon
          const isCurrentTier = currentTier === tierType
          const price = getPrice(tierType, billingCycle)
          
          return (
            <div
              key={tierKey}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                tierType === 'business'
                  ? 'border-emerald-200 ring-2 ring-emerald-100'
                  : 'border-gray-200'
              }`}
            >
              {tierType === 'business' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${tier.color}-100 mb-4`}>
                  <Icon className={`w-6 h-6 text-${tier.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  R{price.toFixed(2)}
                  <span className="text-lg font-normal text-gray-600">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-green-600 font-medium">
                    Save {getSavings(tierType)}% annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(tierType)}
                disabled={isCurrentTier}
                className={`w-full py-3 text-base font-semibold ${
                  tierType === 'business'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } ${isCurrentTier ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isCurrentTier ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Current Plan
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Upgrade to {tier.name}
                  </div>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Current Plan Info */}
      {currentTier !== 'free' && (
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            Currently on <span className="font-semibold capitalize">{currentTier}</span> plan
          </p>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
        billingCycle={billingCycle}
      />
    </div>
  )
}
