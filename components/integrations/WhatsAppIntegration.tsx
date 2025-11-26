'use client'

import { MessageSquare } from 'lucide-react'

export default function WhatsAppIntegration() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-500 p-4 rounded-full">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Messaging</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Use our WhatsApp Send Wizard to connect your account and send messages to groups and contacts.
        </p>
        <a
          href="/whatsapp"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold transition-all"
        >
          Open WhatsApp →
        </a>
      </div>
    </div>
  )
}
