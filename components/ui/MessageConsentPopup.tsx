'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'


interface MessageConsentPopupProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
  businessName: string
  businessAvatar?: string
}

export function MessageConsentPopup({ 
  isOpen, 
  onClose, 
  onAccept, 
  onDecline, 
  businessName,
  businessAvatar
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
      <div className="relative w-full max-w-sm bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in-0 zoom-in-95 duration-500 transform rotate-1 hover:rotate-0 transition-transform" style={{ borderRadius: '11px' }}>

        {/* Header */}
        <div className="relative p-4 border-b-4 border-black bg-gradient-to-r from-green-400 to-blue-400" style={{ borderTopLeftRadius: '11px', borderTopRightRadius: '11px' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3 overflow-hidden" style={{ borderRadius: '11px' }}>
              {businessAvatar ? (
                <img 
                  src={businessAvatar} 
                  alt={businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-black font-black text-sm">
                  {businessName.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-black text-black bg-white px-4 py-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1" style={{ borderRadius: '11px' }}>
              {businessName}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 bg-white" style={{ borderBottomLeftRadius: '11px', borderBottomRightRadius: '11px' }}>
          <div className="text-center mb-5">
            {/* Main Message */}
            <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-4 border-black p-4 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1" style={{ borderRadius: '11px' }}>
              <p className="text-black text-lg font-black leading-tight">
                Wants to share a message with you
              </p>
            </div>
            
            {/* Acceptance Question */}
            <div className="mb-4">
              <p className="text-black text-xl font-black">
                Do you accept ?
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="inline-flex items-center justify-center w-16 h-16"
              style={{
                background: '#22c55e',
                fontFamily: 'inherit',
                fontWeight: 900,
                border: '3px solid black',
                borderRadius: '11px',
                boxShadow: '0.1em 0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                e.currentTarget.style.boxShadow = '0.15em 0.15em';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '0.1em 0.1em';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                e.currentTarget.style.boxShadow = '0.05em 0.05em';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                e.currentTarget.style.boxShadow = '0.15em 0.15em';
              }}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
              ) : (
                <Check className="w-8 h-8 text-white" />
              )}
            </button>
            
            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="inline-flex items-center justify-center w-16 h-16"
              style={{
                background: '#ef4444',
                fontFamily: 'inherit',
                fontWeight: 900,
                border: '3px solid black',
                borderRadius: '11px',
                boxShadow: '0.1em 0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                e.currentTarget.style.boxShadow = '0.15em 0.15em';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '0.1em 0.1em';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                e.currentTarget.style.boxShadow = '0.05em 0.05em';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                e.currentTarget.style.boxShadow = '0.15em 0.15em';
              }}
            >
              <X className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}