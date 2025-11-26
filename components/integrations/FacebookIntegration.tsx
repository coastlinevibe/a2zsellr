'use client'

import { Facebook, Clock } from 'lucide-react'

export default function FacebookIntegration() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-gray-200 rounded-lg p-8 hover:border-blue-500 transition-colors">
        <div className="flex items-start gap-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <Facebook className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Facebook Business</h3>
            <p className="text-gray-600 mb-6">Connect your Facebook Business page to manage messages and inquiries</p>

            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-medium">
          Facebook integration is currently in development. Check back soon!
        </p>
      </div>
    </div>
  )
}
