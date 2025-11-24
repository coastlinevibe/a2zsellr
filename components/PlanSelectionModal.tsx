'use client'

import { useState } from 'react'
import { X, Crown, Sword, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: 'premium' | 'business') => void
  currentTier: 'free' | 'premium' | 'business'
}

export function PlanSelectionModal({ isOpen, onClose, onSelectPlan, currentTier }: PlanSelectionModalProps) {
  if (!isOpen) return null

  const plans = [
    {
      id: 'premium' as const,
      name: 'Premium',
      price: 149,
      icon: Sword,
      color: 'from-yellow-400 to-orange-500',
      features: [
        'Everything in Free',
        '8 gallery images',
        '20 products in shop',
        '8 images per product',
        '8 product/services share links',
        'Multi platform link sharing',
        'Advanced analytics',
        'E-commerce features',
        'Per listing: 3 products OR 8 images'
      ]
    },
    {
      id: 'business' as const,
      name: 'Business',
      price: 299,
      icon: Building2,
      color: 'from-purple-500 to-indigo-600',
      features: [
        'Everything in Premium',
        '12 gallery images',
        'Unlimited products in shop',
        '12 images per product',
        '20 product/services share links',
        'Advanced marketing channels',
        'Bulk campaign management',
        'Priority support',
        'Per listing: 4 products OR 12 images'
      ]
    }
  ]

  // Filter out current tier
  const availablePlans = plans.filter(plan => {
    if (currentTier === 'free') return true
    if (currentTier === 'premium') return plan.id === 'business'
    return false
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <div>
            <h2 className="text-2xl font-black text-black">Choose Your Plan</h2>
            <p className="text-sm font-bold text-gray-600 mt-1">
              Select the plan that best fits your business needs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {availablePlans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className="relative bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all overflow-hidden"
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-xl border-2 border-white/30">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">{plan.name}</h3>
                          <p className="text-white/80 font-bold">Perfect for growing businesses</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl font-black mb-2">R{plan.price}</div>
                      <div className="text-white/80 font-bold">per month</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="bg-green-500 p-1 rounded-full border-2 border-black">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-bold text-gray-800">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => onSelectPlan(plan.id)}
                      className="w-full bg-black text-white font-black py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all"
                    >
                      Select {plan.name}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-600 mb-2">
              🔒 Secure payment powered by PayFast
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
