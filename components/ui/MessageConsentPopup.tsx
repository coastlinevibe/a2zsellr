'use client'

import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'

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

  const handleAccept = () => {
    setIsProcessing(true)
    try {
      onAccept()
    } finally {
      setIsProcessing(false)
      onClose()
    }
  }

  const handleDecline = () => {
    setIsProcessing(true)
    try {
      onDecline()
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(45deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in-0 zoom-in-95 duration-500 transform rotate-1 hover:rotate-0 transition-transform">
        
        {/* Decorative Corner Elements */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>

        {/* Header */}
        <div className="relative p-4 border-b-4 border-black bg-gradient-to-r from-green-400 to-blue-400">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2 transform -rotate-3">
              <MessageCircle className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-xl font-black text-black bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-block transform rotate-1">
              🔓 UNLOCK LISTING
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 bg-white border-2 border-black rounded-full hover:bg-red-300 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 bg-white">
          <div className="text-center mb-5">
            {/* Main Message */}
            <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-4 border-black rounded-2xl p-4 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <p className="text-black text-lg font-black leading-tight">
                <span className="bg-white px-3 py-1 rounded-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mb-2 transform rotate-2">
                  {businessName}
                </span>
                <br />
                <span className="text-2xl">🎯</span> WANTS TO SHARE THEIR LISTING!
              </p>
            </div>
            
            {/* Subtitle */}
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 border-3 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <p className="text-black text-sm font-bold">
                ✨ View their amazing products & services
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center space-x-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform hover:scale-105"
              style={{
                fontSize: '16px'
              }}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
              ) : (
                <>
                  <span className="text-2xl">🚀</span>
                  <span>YES, SHOW ME!</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transform hover:scale-105"
              style={{
                fontSize: '16px'
              }}
            >
              <span className="text-xl">❌</span> NO, THANKS
            </button>
          </div>

          {/* Fun Footer */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <p className="text-xs text-black text-center font-bold">
              🎉 JOIN THE A2Z SELLR COMMUNITY!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}