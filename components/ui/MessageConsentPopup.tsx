'use client'

import { useState } from 'react'
import { X, MessageCircle, Check, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface MessageConsentPopupProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
  businessName: string
}

export function MessageConsentPopup({ 
  isOpen, 
  onClose, 
  onAccept, 
  onDecline, 
  businessName 
}: MessageConsentPopupProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      await onAccept()
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    try {
      await onDecline()
      // Close the browser tab/window when user declines
      window.close()
    } catch (error) {
      console.error('Error handling decline:', error)
      // If window.close() doesn't work (some browsers block it), redirect to a blank page
      window.location.href = 'about:blank'
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Message Permission
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 text-base leading-relaxed">
              <span className="font-semibold text-gray-900">{businessName}</span> wants to share a message with you.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will allow them to send you updates about their products and services.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Yes, I Accept</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDecline}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
            >
              No, Thanks
            </Button>
          </div>

          {/* Privacy Note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Your privacy is important. You can change your preferences at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}