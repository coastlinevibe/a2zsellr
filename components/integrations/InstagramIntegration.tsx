'use client'

import { Instagram, Clock } from 'lucide-react'

export default function InstagramIntegration() {
  return (
    <div className="space-y-6">
      <div className="border-2 border-gray-200 rounded-lg p-8 hover:border-pink-500 transition-colors">
        <div className="flex items-start gap-6">
          <div className="bg-pink-100 p-4 rounded-lg">
            <Instagram className="w-8 h-8 text-pink-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Instagram Business</h3>
            <p className="text-gray-600 mb-6">Connect your Instagram Business account to handle direct messages</p>

            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 text-center">
        <p className="text-pink-900 font-medium">
          Instagram integration is currently in development. Check back soon!
        </p>
      </div>
    </div>
  )
}
