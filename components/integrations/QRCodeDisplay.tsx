'use client'

import { useState, useEffect } from 'react'
import { X, Loader, CheckCircle2 } from 'lucide-react'

interface QRCodeDisplayProps {
  qrCode: string
  platform: string
  isConnected: boolean
  onClose: () => void
  sessionId: string | null
}

export default function QRCodeDisplay({
  qrCode,
  platform,
  isConnected,
  onClose,
  sessionId
}: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (isConnected) {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isConnected])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-4 border-black p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isConnected ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connected!</h3>
                <p className="text-gray-600">Your {platform} account is now connected and ready to use.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            // QR Code State
            <div className="space-y-4">
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-full max-w-xs"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">How to connect:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open {platform} on your phone</li>
                  <li>Go to Settings → Linked Devices</li>
                  <li>Tap "Link a Device"</li>
                  <li>Scan this QR code with your phone</li>
                </ol>
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  QR code expires in{' '}
                  <span className="font-bold text-gray-900">{timeLeft}s</span>
                </p>
                {timeLeft < 10 && (
                  <p className="text-xs text-orange-600 mt-1">
                    QR code expiring soon. Refresh if needed.
                  </p>
                )}
              </div>

              {/* Loading State */}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Waiting for scan...</span>
              </div>
            </div>
          )}
        </div>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center break-all">
              Session: {sessionId}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
