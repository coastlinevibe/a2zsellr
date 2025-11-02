'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import ProductDetail from "@/components/ui/e-commerce-product-detail"

// Service tier data based on subscription tiers
const serviceTiers = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    description: 'Basic business listing with essential features',
    features: [
      'Basic business profile',
      'Contact information display',
      'Business hours listing',
      'Location on map',
      'Basic search visibility'
    ],
    limitations: [
      'No product listings',
      'No gallery uploads',
      'Limited marketing tools',
      'Basic analytics only'
    ],
    buttonText: 'Current Plan',
    buttonDisabled: true,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    description: 'Enhanced features for growing businesses',
    features: [
      'Everything in Free',
      'Up to 10 product listings',
      'Photo gallery (20 images)',
      'Advanced analytics',
      'Priority search ranking',
      'Customer review management',
      'Social media integration',
      'WhatsApp Business integration'
    ],
    limitations: [
      'Limited to 10 products',
      'Basic marketing automation'
    ],
    buttonText: 'Upgrade to Premium',
    buttonDisabled: false,
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 59.99,
    description: 'Full-featured solution for established businesses',
    features: [
      'Everything in Premium',
      'Unlimited product listings',
      'Unlimited photo gallery',
      'Advanced marketing automation',
      'Custom business page design',
      'E-commerce integration',
      'Advanced analytics & reporting',
      'Priority customer support',
      'API access',
      'Multi-location support'
    ],
    limitations: [],
    buttonText: 'Upgrade to Business',
    buttonDisabled: false,
    popular: false
  }
]

const sampleProducts = [
  {
    id: 1,
    name: 'Professional Website Design',
    price: 299.99,
    category: 'Digital Services',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Custom responsive website design for your business'
  },
  {
    id: 2,
    name: 'Social Media Management',
    price: 199.99,
    category: 'Marketing Services',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Monthly social media content creation and management'
  },
  {
    id: 3,
    name: 'Business Consultation',
    price: 149.99,
    category: 'Consulting',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: '2-hour business strategy consultation session'
  }
]

interface PremiumShopServicesProps {
  currentTier?: 'free' | 'premium' | 'business'
  onUpgrade?: (tier: string) => void
}

export default function PremiumShopServices({ 
  currentTier = 'free', 
  onUpgrade 
}: PremiumShopServicesProps) {
  const [activeView, setActiveView] = useState<'products' | 'product-detail'>('products')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleUpgrade = (tierId: string) => {
    if (onUpgrade) {
      onUpgrade(tierId)
    } else {
      // Default behavior - redirect to upgrade page
      window.location.href = `/upgrade?plan=${tierId}`
    }
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setActiveView('product-detail')
  }

  const renderServiceTiers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade Your Business Presence
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan to showcase your business and reach more customers across South Africa
        </p>
      </div>

      {/* Mobile-first tier cards */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {serviceTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl border-2 p-6 ${
              tier.popular
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            } ${currentTier === tier.id ? 'ring-2 ring-emerald-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {currentTier === tier.id && (
              <div className="absolute -top-3 right-4">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  R{tier.price}
                </span>
                {tier.price > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tier.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                What's included:
              </h4>
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            {tier.limitations.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Limitations:
                </h4>
                <ul className="space-y-2">
                  {tier.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={() => handleUpgrade(tier.id)}
              disabled={tier.buttonDisabled || currentTier === tier.id}
              className={`w-full ${
                tier.popular && currentTier !== tier.id
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : ''
              }`}
              variant={currentTier === tier.id ? 'outline' : 'default'}
            >
              {currentTier === tier.id ? 'Current Plan' : tier.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sample Products & Services
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Examples of what you can sell with premium features
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/dashboard/shop/manage'}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Manage Shop
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {product.name}
                </h3>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  R{product.price}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {product.category}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade CTA */}
      {currentTier === 'free' && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ready to start selling?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upgrade to Premium or Business to add your own products and services
          </p>
          <Button
            onClick={() => window.location.href = '/choose-plan'}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            View Upgrade Options
          </Button>
        </div>
      )}
    </div>
  )

  if (activeView === 'product-detail') {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setActiveView('products')}
          variant="outline"
          className="mb-4"
        >
          ← Back to Products
        </Button>
        <ProductDetail />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Content - Only show products, no tier pricing */}
      {renderProducts()}
    </div>
  )
}
