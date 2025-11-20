'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CreditCard, CheckCircle, XCircle } from 'lucide-react'

interface ProcessResult {
  user: string
  email: string
  tier: string
  success: boolean
  error?: string
}

export function PayFastProcessor() {
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessResult[]>([])
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  const checkPendingPayments = async () => {
    try {
      const response = await fetch('/api/admin/process-payfast')
      const data = await response.json()
      
      if (response.ok) {
        setPendingCount(data.pending_count)
      }
    } catch (error) {
      console.error('Error checking pending payments:', error)
    }
  }

  const processPayments = async () => {
    if (!confirm('Process all pending PayFast payments? This will upgrade users to their paid tiers.')) {
      return
    }

    setProcessing(true)
    setResults([])

    try {
      const response = await fetch('/api/admin/process-payfast', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results || [])
        setPendingCount(0)
        alert(`✅ Processed ${data.processed} payments successfully!`)
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error processing payments:', error)
      alert('❌ Failed to process payments')
    } finally {
      setProcessing(false)
    }
  }

  // Check pending payments on component mount
  useEffect(() => {
    checkPendingPayments()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase">PAYFAST PROCESSOR</h2>
            <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
              AUTO-UPGRADE PAID SUBSCRIPTIONS
            </p>
          </div>
          <CreditCard className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div 
        className="bg-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-black uppercase">Pending PayFast Payments</h3>
          <motion.button
            onClick={checkPendingPayments}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="text-center">
          <div className="text-6xl font-black text-orange-500 mb-2">
            {pendingCount !== null ? pendingCount : '...'}
          </div>
          <p className="text-lg font-bold text-gray-600">
            Payments awaiting processing
          </p>
        </div>

        {pendingCount !== null && pendingCount > 0 && (
          <motion.button
            onClick={processPayments}
            disabled={processing}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
            whileHover={{ scale: processing ? 1 : 1.02 }}
            whileTap={{ scale: processing ? 1 : 0.98 }}
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                PROCESSING...
              </div>
            ) : (
              `PROCESS ${pendingCount} PAYMENTS`
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div 
          className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transform -rotate-1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 border-b-4 border-black">
            <h3 className="text-xl font-black text-white uppercase">Processing Results</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                className={`p-3 rounded-lg border-2 border-black flex items-center justify-between ${
                  result.success ? 'bg-green-100' : 'bg-red-100'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div>
                  <div className="font-black text-black">
                    {result.user} ({result.email})
                  </div>
                  <div className="text-sm font-bold text-gray-600">
                    {result.success ? `Upgraded to ${result.tier.toUpperCase()}` : result.error}
                  </div>
                </div>
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}