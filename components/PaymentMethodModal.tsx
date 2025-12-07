'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Building2, ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  selectedPlan: 'premium' | 'business'
  userProfile: any
}

export function PaymentMethodModal({ isOpen, onClose, onBack, selectedPlan, userProfile }: PaymentMethodModalProps) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'eft' | null>(null)
  const [error, setError] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [sandboxMode, setSandboxMode] = useState(false)
  const [paymentEnabled, setPaymentEnabled] = useState(true)

  if (!isOpen) return null

  // Check payment settings on mount
  useEffect(() => {
    checkPaymentSettings()
  }, [])

  const checkPaymentSettings = async () => {
    try {
      const { data: sandboxSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'sandbox_mode')
        .single()

      const { data: paymentSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'payment_enabled')
        .single()

      if (sandboxSetting) {
        setSandboxMode(sandboxSetting.value === 'true' || sandboxSetting.value === true)
      }
      if (paymentSetting) {
        setPaymentEnabled(paymentSetting.value === 'true' || paymentSetting.value === true)
      }
    } catch (err) {
      console.log('Payment settings not found, using defaults')
    }
  }

  const planDetails = {
    premium: { name: 'Premium', price: 14900 }, // In cents
    business: { name: 'Business', price: 29900 } // In cents
  }

  const plan = planDetails[selectedPlan]
  const displayAmount = (plan.price / 100).toFixed(2)

  const handlePayFastPayment = async () => {
    if (!userProfile || !user) return
    
    setIsProcessing(true)
    setError('')
    
    try {
      // Generate payment reference
      const reference = `${user.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}`
      
      // Create payment transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: user.id,
          payment_method: 'payfast',
          amount_cents: plan.price,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // PayFast payment data
      const returnUrl = new URL(`${window.location.origin}/payment/success`)
      returnUrl.searchParams.set('method', 'payfast')
      returnUrl.searchParams.set('transaction_id', transaction.id)

      const paymentData = {
        merchant_id: "10000100",
        merchant_key: "46f0cd694581a",
        return_url: returnUrl.toString(),
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payfast/webhook`,
        
        amount: displayAmount,
        item_name: `${selectedPlan.toUpperCase()} Subscription`,
        item_description: `A2Z ${selectedPlan} tier subscription`,
        
        name_first: userProfile?.display_name || 'User',
        email_address: userProfile?.email || user?.email,
        
        custom_str1: user.id,
        custom_str2: selectedPlan,
        custom_str3: transaction.id,
        custom_str4: 'monthly',
        
        m_payment_id: reference
      }

      // Create and submit PayFast form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://sandbox.payfast.co.za/eng/process'
      
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      })
      
      document.body.appendChild(form)
      form.submit()

    } catch (error) {
      console.error('Payment error:', error)
      setError('Failed to initiate PayFast payment')
      setIsProcessing(false)
    }
  }

  const handleEFTPayment = async () => {
    if (!user) return
    
    setIsProcessing(true)
    setError('')

    try {
      // Generate payment reference
      const reference = `${user.id.substring(0, 8).toUpperCase()}_${selectedPlan.toUpperCase()}`
      
      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          profile_id: user.id,
          payment_method: 'eft',
          amount_cents: plan.price,
          reference,
          tier_requested: selectedPlan,
          status: 'pending'
        })

      if (transactionError) throw transactionError

      setPaymentMethod('eft')
      
    } catch (err) {
      console.error('EFT payment error:', err)
      setError('Failed to initiate EFT payment')
      setIsProcessing(false)
    }
  }

  const handleProofUpload = async () => {
    if (!proofFile || !user) return

    setUploadingProof(true)
    setError('')

    try {
      // Upload proof of payment
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `${user.id}/proof-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)

      // Update transaction with proof
      await supabase
        .from('payment_transactions')
        .update({
          proof_of_payment_url: publicUrl
        })
        .eq('profile_id', user.id)
        .eq('status', 'pending')
        .eq('payment_method', 'eft')

      // Redirect to success page with EFT method
      window.location.href = `/payment/success?method=eft`
      
    } catch (err) {
      console.error('Proof upload error:', err)
      setError('Failed to upload proof of payment')
    } finally {
      setUploadingProof(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Complete Payment for {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Pricing Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg">R{displayAmount}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!paymentMethod ? (
            /* Payment Method Selection */
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-4">Choose Payment Method:</h4>
              
              {/* PayFast Option */}
              <button
                onClick={handlePayFastPayment}
                disabled={isProcessing}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="font-medium text-gray-900">PayFast (Instant Activation)</div>
                    <div className="text-sm text-gray-600">Cards, EFT, SnapScan, Zapper</div>
                  </div>
                </div>
              </button>

              {/* EFT Option */}
              <button
                onClick={handleEFTPayment}
                disabled={isProcessing}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Manual EFT (Admin Approval)</div>
                    <div className="text-sm text-gray-600">Bank transfer with proof of payment</div>
                  </div>
                </div>
              </button>
            </div>
          ) : paymentMethod === 'eft' && (
            /* EFT Banking Details */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Banking Details:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Bank:</span>
                    <span className="font-medium">Standard Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Account Name:</span>
                    <span className="font-medium">A2Z Business Directory</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Account Number:</span>
                    <span className="font-medium">123456789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Branch Code:</span>
                    <span className="font-medium">051001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Reference:</span>
                    <span className="font-medium">{user?.id.substring(0, 8).toUpperCase()}_{selectedPlan.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="font-bold">R{displayAmount}</span>
                  </div>
                </div>
              </div>

              {/* Proof Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Proof of Payment
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {proofFile && (
                  <p className="text-sm text-green-600 mt-1">
                    <Check className="w-4 h-4 inline mr-1" />
                    {proofFile.name} selected
                  </p>
                )}
              </div>

              <Button
                onClick={handleProofUpload}
                disabled={!proofFile || uploadingProof}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {uploadingProof ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Proof
                  </div>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your payment will be verified by our admin team within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
