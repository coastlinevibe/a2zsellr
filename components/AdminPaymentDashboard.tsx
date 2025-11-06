'use client'

import { useState, useEffect } from 'react'
import { Eye, Check, X, Download, Calendar, CreditCard, Building2, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
          <p className="text-gray-600">Manage subscription payments and approvals</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total Payments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'paid').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Pending EFT</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {payments.filter(p => p.payment_method === 'eft' && p.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            R{(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Payments' },
          { key: 'pending', label: 'Pending' },
          { key: 'paid', label: 'Completed' },
          { key: 'eft_pending', label: 'EFT Pending' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            onClick={() => setFilter(key as any)}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                <th className="text-left p-4 font-medium text-gray-900">Plan</th>
                <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                <th className="text-left p-4 font-medium text-gray-900">Method</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{payment.display_name}</div>
                      <div className="text-sm text-gray-600">{payment.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-medium">{payment.tier_requested}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">R{(payment.amount_cents / 100).toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {payment.payment_method === 'payfast' ? (
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-green-500" />
                      )}
                      <span className="capitalize">{payment.payment_method}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status, payment.payment_method)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status_display}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      onClick={() => setSelectedPayment(payment)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">{selectedPayment.display_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedPayment.email}</div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Reference:</span>
                    <div className="font-medium">{selectedPayment.reference}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <div className="font-medium">R{(selectedPayment.amount_cents / 100).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan:</span>
                    <div className="font-medium capitalize">{selectedPayment.tier_requested}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <div className="font-medium capitalize">{selectedPayment.payment_method}</div>
                  </div>
                </div>
              </div>

              {/* Proof of Payment (EFT only) */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.proof_of_payment_url && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Proof of Payment</h4>
                  <div className="border rounded-lg p-4">
                    <img
                      src={selectedPayment.proof_of_payment_url}
                      alt="Proof of Payment"
                      className="max-w-full h-auto rounded"
                    />
                    <Button
                      onClick={() => window.open(selectedPayment.proof_of_payment_url!, '_blank')}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this payment..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedPayment.payment_method === 'eft' && selectedPayment.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => approveEFTPayment(selectedPayment.id, selectedPayment.profile_id, selectedPayment.tier_requested)}
                    disabled={processingPayment === selectedPayment.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingPayment === selectedPayment.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Approve Payment
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => rejectEFTPayment(selectedPayment.id)}
                    disabled={processingPayment === selectedPayment.id}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
