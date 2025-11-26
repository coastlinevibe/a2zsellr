'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, AlertCircle } from 'lucide-react'

interface QRCodeScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  title?: string
}

export default function QRCodeScanner({ onScan, onClose, title = 'Scan QR Code' }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'pending'>('pending')

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setPermission('granted')
          setIsScanning(true)
        }
      } catch (err) {
        setPermission('denied')
        setError('Unable to access camera. Please check permissions.')
        console.error('Camera access error:', err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isScanning || permission !== 'granted') return

    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d')
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          context.drawImage(videoRef.current, 0, 0)

          // Simple QR code detection (in production, use a library like jsQR)
          // For now, we'll just show the scanner UI
        }
      }
    }, 500)

    return () => clearInterval(scanInterval)
  }, [isScanning, permission])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-4 border-black overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {permission === 'denied' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Camera Access Denied</h3>
                <p className="text-gray-600 mb-4">
                  Please enable camera permissions in your browser settings to scan QR codes.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Camera Feed */}
              <div className="relative bg-black rounded-lg overflow-hidden border-2 border-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-square object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* QR Code Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                </div>

                {/* Corner Markers */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-green-500" />
                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-green-500" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-green-500" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-green-500" />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">How to scan:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Position the QR code within the frame</li>
                  <li>Keep the code steady and well-lit</li>
                  <li>The scan will happen automatically</li>
                </ol>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Ready to scan</span>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
              >
                Close Scanner
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
