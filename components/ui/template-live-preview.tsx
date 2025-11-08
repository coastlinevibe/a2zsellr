'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Heart, 
  Users, 
  CheckCircle, 
  Phone, 
  Mail,
  Star,
  ArrowRight,
  Stethoscope,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TemplateLivePreviewProps {
  templateData: any
  scale?: number
}

export default function TemplateLivePreview({ templateData, scale = 0.5 }: TemplateLivePreviewProps) {
  const {
    businessName,
    businessDescription,
    contactPhone,
    contactEmail,
    heroHeadline,
    heroSubheadline,
    heroLayout,
    headerStyle,
    footerStyle,
    ctaPrimary,
    ctaSecondary,
    plans,
    testimonials
  } = templateData

  return (
    <div 
      className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      {/* Header */}
      <div className={`px-6 py-4 ${
        headerStyle === 'gradient' 
          ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white' 
          : 'bg-white border-b border-gray-200 text-gray-900'
      }`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{businessName}</h1>
          <div className="flex gap-4 text-sm">
            <span>{contactPhone}</span>
            <span>{contactEmail}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {heroLayout === 'full-width' ? (
        // Full-width banner
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{heroHeadline}</h1>
            <p className="text-xl mb-8 text-blue-100">{heroSubheadline}</p>
            <div className="flex justify-center gap-4">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3">
                {ctaPrimary}
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3">
                {ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // 50/50 split layout
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-12 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-bold mb-4">{heroHeadline}</h1>
              <p className="text-lg mb-6 text-blue-100">{heroSubheadline}</p>
              <div className="flex gap-3">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  {ctaPrimary}
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  {ctaSecondary}
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <Stethoscope className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <p className="text-white/90">Professional Healthcare Coverage</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xs text-gray-900 mb-1">Trusted Coverage</h3>
              <p className="text-xs text-gray-600">Over a decade of reliable service</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-teal-100 p-2 rounded-full mb-2">
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="font-semibold text-xs text-gray-900 mb-1">Quick Claims</h3>
              <p className="text-xs text-gray-600">Claims processed in minutes</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-full mb-2">
                <Heart className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-xs text-gray-900 mb-1">Family First</h3>
              <p className="text-xs text-gray-600">Comprehensive family coverage</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-xs text-gray-900 mb-1">Expert Support</h3>
              <p className="text-xs text-gray-600">Dedicated customer care team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Perfect Plan</h2>
            <p className="text-gray-600">{businessDescription}</p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {plans.map((plan: any, index: number) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                  plan.popular ? 'ring-1 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="text-lg font-bold text-blue-600">{plan.price}</div>
                  <p className="text-xs text-gray-500">per month</p>
                </div>

                <ul className="space-y-1 mb-4">
                  {plan.features.slice(0, 3).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-xs text-gray-500">+{plan.features.length - 3} more</li>
                  )}
                </ul>

                <Button 
                  size="sm"
                  className={`w-full text-xs ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Choose {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {footerStyle === 'detailed' ? (
        <div className="bg-gray-900 text-white py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">{businessName}</h3>
                <p className="text-gray-400 text-xs">{businessDescription}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-gray-400 text-xs">{contactPhone}</p>
                <p className="text-gray-400 text-xs">{contactEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Links</h3>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-400">About Us</p>
                  <p className="text-gray-400">Plans</p>
                  <p className="text-gray-400">Contact</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 pt-4 text-center text-xs text-gray-400">
              © 2024 {businessName}. All rights reserved.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 py-4 px-6 text-center">
          <p className="text-sm text-gray-600">© 2024 {businessName} | {contactPhone} | {contactEmail}</p>
        </div>
      )}
    </div>
  )
}
