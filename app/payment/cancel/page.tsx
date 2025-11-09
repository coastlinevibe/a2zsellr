'use client'

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled and no charges were made to your account. You can try again anytime.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Try Payment Again
            </div>
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </div>
          </Button>
        </div>

        {/* Help Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Need help?</strong><br />
            Contact our support team if you're experiencing issues with payment processing.
          </p>
        </div>
      </div>
    </div>
  )
}
