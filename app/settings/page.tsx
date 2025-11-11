'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bell, Trash2, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState<'confirm' | 'typeName'>('confirm')
  const [typedName, setTypedName] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login-animated')
      return
    }

    // Fetch user profile for display name confirmation
    const fetchProfile = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setUserProfile(data)
      }
    }

    fetchProfile()
  }, [user, router])

  const handleDeleteAccount = async () => {
    if (!user) {
      alert('You must be logged in to delete your account.')
      return
    }

    if (confirmationStep === 'confirm') {
      // First confirmation - show type name modal
      setConfirmationStep('typeName')
      return
    }

    // Second confirmation - verify typed name matches
    if (!userProfile || typedName !== userProfile.display_name) {
      alert('Display name does not match. Account deletion cancelled.')
      setShowDeleteModal(false)
      setConfirmationStep('confirm')
      setTypedName('')
      return
    }

    setLoading(true)

    try {
      // Delete all user data in the correct order (respecting foreign key constraints)

      // 1. Delete order status history where user created entries
      const { error: historyError } = await supabase
        .from('order_status_history')
        .delete()
        .eq('created_by', user.id)

      if (historyError) console.warn('Error deleting order history:', historyError)

      // 2. Delete order items for orders where user is customer or business
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .or(`order_id.in.(select id from orders where customer_id.eq.${user.id}),order_id.in.(select id from orders where business_id.eq.${user.id})`)

      if (itemsError) console.warn('Error deleting order items:', itemsError)

      // 3. Delete orders where user is customer
      const { error: customerOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('customer_id', user.id)

      if (customerOrdersError) console.warn('Error deleting customer orders:', customerOrdersError)

      // 4. Delete orders where user is business (this will cascade to order_items)
      const { error: businessOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('business_id', user.id)

      if (businessOrdersError) console.warn('Error deleting business orders:', businessOrdersError)

      // 5. Delete user's WhatsApp campaigns (this will cascade to layouts and executions)
      const { error: campaignsError } = await supabase
        .from('whatsapp_campaigns')
        .delete()
        .eq('profile_id', user.id)

      if (campaignsError) console.warn('Error deleting campaigns:', campaignsError)

      // 6. Delete user's listings
      const { error: listingsError } = await supabase
        .from('profile_listings')
        .delete()
        .eq('profile_id', user.id)

      if (listingsError) console.warn('Error deleting listings:', listingsError)

      // 7. Delete user's gallery items
      const { error: galleryError } = await supabase
        .from('profile_gallery')
        .delete()
        .eq('profile_id', user.id)

      if (galleryError) console.warn('Error deleting gallery:', galleryError)

      // 8. Delete user's products
      const { error: productsError } = await supabase
        .from('profile_products')
        .delete()
        .eq('profile_id', user.id)

      if (productsError) console.warn('Error deleting products:', productsError)

      // 9. Delete referral records (both as referrer and referred)
      const { error: referralsError } = await supabase
        .from('referrals')
        .delete()
        .or(`referrer_id.eq.${user.id},referred_user_id.eq.${user.id}`)

      if (referralsError) console.warn('Error deleting referrals:', referralsError)

      // 10. Delete user's profile (this should cascade to other related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        throw new Error(`Failed to delete profile: ${profileError.message}`)
      }

      // 11. Sign out and redirect
      await signOut()
      router.push('/')

      alert('Account deleted successfully. All your data has been permanently removed.')

    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
      setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setConfirmationStep('confirm')
    setTypedName('')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates about your listings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Expiration Warnings</h3>
                  <p className="text-sm text-gray-500">Get notified before listings expire</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <h3 className="font-medium text-red-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmationStep === 'confirm' ? 'Delete Account' : 'Confirm Deletion'}
              </h3>
              <button
                onClick={handleCancelDelete}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmationStep === 'confirm' ? (
              <>
                <p className="text-gray-600 mb-6">
                  This will permanently delete your account and all associated data including:
                  products, listings, orders, and referral history. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelDelete}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  To confirm deletion, please type your display name:
                  <span className="font-semibold text-gray-900 block mt-1">
                    {userProfile?.display_name}
                  </span>
                </p>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your display name here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelDelete}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading || !typedName.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
