'use client'

import { useState, useEffect } from 'react'
import { Eye, Check, X, Download, Calendar, CreditCard, Building2, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

interface PaymentTransaction {
  id: string
  reference: string
  display_name: string
  email: string
  payment_method: 'payfast' | 'eft'
  tier_requested: 'premium' | 'business'
  amount_cents: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  payment_date: string | null
  proof_of_payment_url: string | null
  admin_notes: string | null
  created_at: string
  status_display: string
  profile_id: string
}

export function AdminPaymentDashboard() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'eft_pending'>('all')
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_payment_overview')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    switch (filter) {
      case 'pending':
        return payment.status === 'pending'
      case 'paid':
        return payment.status === 'paid'
      case 'eft_pending':
        return payment.payment_method === 'eft' && payment.status === 'pending'
      default:
        return true
    }
  })

  const approveEFTPayment = async (paymentId: string, profileId: string, tier: string) => {
    setProcessingPayment(paymentId)
    
    try {
      // Update transaction status
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString(),
          admin_notes: adminNotes || 'Approved by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (transactionError) throw transactionError

      // Activate subscription
      const { error: activationError } = await supabase
        .rpc('activate_subscription', {
          p_profile_id: profileId,
          p_tier: tier,
          p_billing_cycle: 'monthly' // Default to monthly for EFT
        })

      if (activationError) throw activationError

      alert('✅ Payment approved and subscription activated!')
      setAdminNotes('')
      setSelectedPayment(null)
      fetchPayments()
      
    } catch (error) {
      console.error('Error approving payment:', error)
      alert('❌ Error approving payment. Please try again.')
    } finally {
      setProcessingPayment(null)
    }
  }

  const rejectEFTPayment = async (paymentId: string) => {
    setProcessingPayment(paymentId)
    
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          admin_notes: adminNotes || 'Rejected by admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (error) throw error

      alert('❌ Payment rejected')
      setAdminNotes('')
      setSelectedPayment(null)
      fetchPayments()
      
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('❌ Error rejecting payment. Please try again.')
    } finally {
      setProcessingPayment(null)
    }
  }

  const getStatusIcon = (status: string, paymentMethod: string) => {
    if (status === 'paid') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (status === 'failed') return <X className="w-5 h-5 text-red-500" />
    if (status === 'pending' && paymentMethod === 'eft') return <AlertCircle className="w-5 h-5 text-orange-500" />
    return <Clock className="w-5 h-5 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase">PAYMENT MANAGEMENT</h2>
            <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
              MANAGE SUBSCRIPTION PAYMENTS & APPROVALS
            </p>
          </div>
          <motion.button
            onClick={fetchPayments}
            className="bg-white text-black px-4 py-2 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2"
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
          >
            <motion.div
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            REFRESH
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-blue-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ 
            scale: 1.05,
            rotate: 2,
            transition: { duration: 0.2 }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">TOTAL PAYMENTS</p>
              <p className="text-4xl font-black text-white">{payments.length}</p>
            </div>
            <motion.div 
              className="bg-white p-2 rounded-lg border-2 border-black"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <CreditCard className="w-6 w-6 text-blue-600" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-green-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ 
            scale: 1.05,
            rotate: -2,
            transition: { duration: 0.2 }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">COMPLETED</p>
              <p className="text-4xl font-black text-white">
                {payments.filter(p => p.status === 'paid').length}
              </p>
            </div>
            <motion.div 
              className="bg-white p-2 rounded-lg border-2 border-black"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <CheckCircle className="w-6 h-6 text-green-600" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-orange-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            rotate: 2,
            transition: { duration: 0.2 }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">PENDING EFT</p>
              <p className="text-4xl font-black text-white">
                {payments.filter(p => p.payment_method === 'eft' && p.status === 'pending').length}
              </p>
            </div>
            <motion.div 
              className="bg-white p-2 rounded-lg border-2 border-black"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-purple-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ 
            scale: 1.05,
            rotate: -2,
            transition: { duration: 0.2 }
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">TOTAL REVENUE</p>
              <p className="text-4xl font-black text-white">
                R{(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) / 100).toFixed(2)}
              </p>
            </div>
            <motion.div 
              className="bg-white p-2 rounded-lg border-2 border-black"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <Building2 className="w-6 h-6 text-purple-600" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 justify-center">
        {[
          { key: 'all', label: 'ALL PAYMENTS', color: 'bg-gray-500' },
          { key: 'pending', label: 'PENDING', color: 'bg-orange-500' },
          { key: 'paid', label: 'COMPLETED', color: 'bg-green-500' },
          { key: 'eft_pending', label: 'EFT PENDING', color: 'bg-blue-500' }
        ].map(({ key, label, color }) => (
          <motion.button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all ${
              filter === key 
                ? `${color} text-white` 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Payments Table */}
      <motion.div 
        className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transform rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-yellow-400 to-orange-400 border-b-4 border-black">
              <tr>
                <th className="text-left p-4 font-black text-black uppercase">CUSTOMER</th>
                <th className="text-left p-4 font-black text-black uppercase">PLAN</th>
                <th className="text-left p-4 font-black text-black uppercase">AMOUNT</th>
                <th className="text-left p-4 font-black text-black uppercase">METHOD</th>
                <th className="text-left p-4 font-black text-black uppercase">STATUS</th>
                <th className="text-left p-4 font-black text-black uppercase">DATE</th>
                <th className="text-left p-4 font-black text-black uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-4 divide-black">
              {filteredPayments.map((payment, index) => (
                <motion.tr 
                  key={payment.id} 
                  className="hover:bg-yellow-100 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-black text-black">{payment.display_name}</div>
                      <div className="text-sm font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded border border-black inline-block">
                        {payment.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase ${
                      payment.tier_requested === 'premium' ? 'bg-purple-400 text-white' : 'bg-green-400 text-black'
                    }`}>
                      {payment.tier_requested}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-lg text-black">R{(payment.amount_cents / 100).toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded border-2 border-black ${
                        payment.payment_method === 'payfast' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {payment.payment_method === 'payfast' ? (
                          <CreditCard className="w-4 h-4 text-white" />
                        ) : (
                          <Building2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-bold text-black uppercase">{payment.payment_method}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase ${
                        payment.status === 'paid' ? 'bg-green-500 text-white' :
                        payment.status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {payment.status_display}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-black">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <motion.button
                      onClick={() => setSelectedPayment(payment)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] flex items-center gap-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="w-4 h-4" />
                      VIEW
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto transform rotate-1"
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <div className="bg-gradient-to-r from-purple-400 to-blue-500 p-6 border-b-4 border-black rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase">PAYMENT DETAILS</h3>
                <motion.button
                  onClick={() => setSelectedPayment(null)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">CUSTOMER INFORMATION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-black font-bold">NAME:</span>
                    <div className="font-black text-black">{selectedPayment.display_name}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">EMAIL:</span>
                    <div className="font-black text-black">{selectedPayment.email}</div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">PAYMENT INFORMATION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-black font-bold">REFERENCE:</span>
                    <div className="font-black text-black">{selectedPayment.reference}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">AMOUNT:</span>
                    <div className="font-black text-black text-lg">R{(selectedPayment.amount_cents / 100).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">PLAN:</span>
                    <div className="font-black text-black uppercase">{selectedPayment.tier_requested}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">METHOD:</span>
                    <div className="font-black text-black uppercase">{selectedPayment.payment_method}</div>
                  </div>
                </div>
              </div>

              {/* Proof of Payment (EFT only) */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.proof_of_payment_url && (
                <div className="bg-yellow-100 p-4 rounded-xl border-2 border-black">
                  <h4 className="font-black text-black mb-3 uppercase">PROOF OF PAYMENT</h4>
                  <div className="border-2 border-black rounded-lg p-4 bg-white">
                    <img
                      src={selectedPayment.proof_of_payment_url}
                      alt="Proof of Payment"
                      className="max-w-full h-auto rounded border-2 border-black"
                    />
                    <motion.button
                      onClick={() => window.open(selectedPayment.proof_of_payment_url!, '_blank')}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.status === 'pending' && (
                <div className="bg-purple-100 p-4 rounded-xl border-2 border-black">
                  <label className="block font-black text-black mb-2 uppercase">
                    ADMIN NOTES
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="ADD NOTES ABOUT THIS PAYMENT..."
                    className="w-full p-3 border-2 border-black rounded-lg resize-none font-bold bg-white"
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.status === 'pending' && (
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => approveEFTPayment(selectedPayment.id, selectedPayment.profile_id, selectedPayment.tier_requested)}
                    disabled={processingPayment === selectedPayment.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {processingPayment === selectedPayment.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        PROCESSING...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        APPROVE PAYMENT
                      </div>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => rejectEFTPayment(selectedPayment.id)}
                    disabled={processingPayment === selectedPayment.id}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" />
                      REJECT
                    </div>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
