'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Crown, Users, Star, ArrowRight } from 'lucide-react'

export default function ChoosePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState(searchParams?.get('plan') || 'premium')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      icon: Check,
      color: 'gray',
      features: [
        'Basic business profile',
        '3 gallery images',
        '5 products in shop',
        'Contact information',
        'Location mapping',
        'Customer reviews'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      icon: Crown,
      color: 'emerald',
      popular: true,
      features: [
        'Everything in Free',
        'Premium directory placement',
        'Gallery slider showcase',
        'Shop integration',
        'WhatsApp ad scheduling',
        'Facebook campaign tools'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 299,
      icon: Users,
      color: 'blue',
      features: [
        'Everything in Premium',
        'Multi-location management',
        'Advanced analytics',
        'Instagram ad automation',
        'Custom branding',
        'Priority support'
      ]
    }
  ]

  const handlePlanSelect = (planId: string) => {
    router.push(`/auth/signup-animated?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-purple-800/50"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-8">
            <div className="text-2xl font-bold text-white">A2Z Business Directory</div>
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with our free plan or upgrade to unlock premium features for your business
          </p>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isPopular = plan.popular
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 ${
                  isPopular ? 'ring-2 ring-emerald-500 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    plan.color === 'emerald' ? 'bg-emerald-100' :
                    plan.color === 'blue' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.color === 'emerald' ? 'text-emerald-600' :
                      plan.color === 'blue' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">Free</div>
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          R{plan.price}
                        </div>
                        <div className="text-gray-600">per month</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 text-base font-semibold flex items-center justify-center gap-2 rounded-lg transition-colors ${
                    isPopular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : plan.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {plan.id === 'free' ? 'Start Free' : `Choose ${plan.name}`}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-4">
            All plans include our core directory features and customer support
          </p>
          <Link
            href="/"
            className="text-white/80 hover:text-white text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
