'use client'

import Link from 'next/link'
import { MessageCircle, CreditCard, AlertCircle, CheckCircle, Edit } from 'lucide-react'

interface ProfileSettingsTabProps {
  profile: {
    id: string
    display_name: string | null
    email: string | null
    phone_number: string | null
    website_url: string | null
    business_category: string | null
    business_location: string | null
    bio: string | null
    subscription_tier: 'free' | 'premium' | 'business'
  }
}

export function ProfileSettingsTab({ profile }: ProfileSettingsTabProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'd like to setup payment for my A2Z Sellr account. My profile name is: ${profile.display_name || 'My Profile'}`
    )
    window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-8">

      {/* Payment Setup Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[9px] shadow-sm border-2 border-green-300 overflow-hidden">
        <div className="p-6 border-b-2 border-green-300">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Setup Payment</h2>
              <p className="text-gray-600 mt-1">Configure PayFast or EFT payment methods</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg p-6 border-2 border-green-200 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Payment Configuration Required</h3>
                <p className="text-gray-700 mb-4">
                  To enable PayFast or EFT payments for your business, please contact our support team via WhatsApp. 
                  Our team will help you set up the payment gateway and configure your merchant account.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>PayFast integration setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>EFT payment configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Payment verification and testing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg border-2 border-green-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-3 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Contact Us on WhatsApp</span>
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            WhatsApp: <span className="font-bold text-gray-900">+27 71 432 9190</span>
          </p>
        </div>
      </div>

    </div>
  )
}
