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
      console.log(`🚨 SELF-DELETE ACCOUNT CALLED: ${user.id} (${userProfile.display_name})`)
      console.log(`🗑️ Starting complete deletion of user: ${user.id} (${userProfile.display_name})`)

      // First, let's get all user data that contains storage files (same as admin delete)
      const { data: existingProducts, error: productsReadError } = await supabase
        .from('profile_products')
        .select('id, name, profile_id, image_url, images')
        .eq('profile_id', user.id)
      
      const { data: existingGallery, error: galleryReadError } = await supabase
        .from('profile_gallery')
        .select('id, image_url, storage_path')
        .eq('profile_id', user.id)
      
      console.log(`🔍 Found ${existingProducts?.length || 0} products for user ${user.id}:`, existingProducts)
      console.log(`🔍 Found ${existingGallery?.length || 0} gallery items for user ${user.id}:`, existingGallery)
      
      if (productsReadError) {
        console.error('❌ Error reading products:', productsReadError)
      }
      if (galleryReadError) {
        console.error('❌ Error reading gallery:', galleryReadError)
      }

      // Extract all storage paths that need to be deleted (same as admin delete)
      const storagePaths: string[] = []
      
      // Get product image paths
      existingProducts?.forEach(product => {
        if (product.image_url) {
          // Extract path from URL
          const urlParts = product.image_url.split('/product-images/')
          if (urlParts.length > 1) {
            storagePaths.push(urlParts[1])
          }
        }
        
        // Handle multiple images in JSON format
        if (product.images) {
          try {
            const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
            if (Array.isArray(images)) {
              images.forEach((img: any) => {
                if (img.url) {
                  const urlParts = img.url.split('/product-images/')
                  if (urlParts.length > 1) {
                    storagePaths.push(urlParts[1])
                  }
                }
              })
            }
          } catch (e) {
            console.warn('Could not parse product images JSON:', e)
          }
        }
      })
      
      // Get gallery image paths
      existingGallery?.forEach(item => {
        if (item.storage_path) {
          storagePaths.push(item.storage_path)
        } else if (item.image_url) {
          // Try to extract path from URL
          const urlParts = item.image_url.split('/sharelinks/')
          if (urlParts.length > 1) {
            storagePaths.push(urlParts[1])
          }
        }
      })
      
      console.log(`🗑️ Found ${storagePaths.length} storage files to delete:`, storagePaths)

      // Count items before deletion for logging (same as admin delete)
      const [productsCount, listingsCount, galleryCount, analyticsCount] = await Promise.all([
        supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_analytics').select('id', { count: 'exact' }).eq('profile_id', user.id)
      ])

      const productsToDelete = productsCount.count || 0
      const listingsToDelete = listingsCount.count || 0
      const galleryToDelete = galleryCount.count || 0
      const analyticsToDelete = analyticsCount.count || 0

      console.log(`📊 Items to delete: ${productsToDelete} products, ${listingsToDelete} listings, ${galleryToDelete} gallery, ${analyticsToDelete} analytics`)

      // Delete all user-related data in sequence (same as admin delete)
      console.log('🗑️ Deleting user products...')
      const { error: productsError, data: deletedProducts } = await supabase
        .from('profile_products')
        .delete()
        .eq('profile_id', user.id)
        .select()
      
      console.log(`🗑️ Products deletion result:`, { error: productsError, deletedCount: deletedProducts?.length || 0 })

      console.log('🗑️ Deleting user listings...')
      const { error: listingsError } = await supabase
        .from('profile_listings')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting user gallery...')
      const { error: galleryError } = await supabase
        .from('profile_gallery')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting user analytics...')
      const { error: analyticsError } = await supabase
        .from('profile_analytics')
        .delete()
        .eq('profile_id', user.id)

      // Try to delete from other possible tables (same as admin delete)
      console.log('🗑️ Deleting payment transactions...')
      const { error: paymentsError } = await supabase
        .from('payment_transactions')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting reset history...')
      const { error: resetHistoryError } = await supabase
        .from('reset_history')
        .delete()
        .eq('profile_id', user.id)

      // Delete additional tables that might exist
      console.log('🗑️ Deleting order status history...')
      const { error: historyError } = await supabase
        .from('order_status_history')
        .delete()
        .eq('created_by', user.id)

      console.log('🗑️ Deleting campaign media...')
      const { error: campaignMediaError } = await supabase
        .from('campaign_media')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting campaign executions...')
      const { error: executionsError } = await supabase
        .from('campaign_executions')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting whatsapp campaigns...')
      const { error: whatsappError } = await supabase
        .from('whatsapp_campaigns')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting marketing campaigns...')
      const { error: campaignsError } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting social media groups...')
      const { error: groupsError } = await supabase
        .from('social_media_groups')
        .delete()
        .eq('created_by', user.id)

      console.log('🗑️ Deleting reviews...')
      const { error: reviewsError } = await supabase
        .from('profile_reviews')
        .delete()
        .eq('profile_id', user.id)

      console.log('🗑️ Deleting order items...')
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .or(`order_id.in.(select id from orders where customer_id.eq.${user.id}),order_id.in.(select id from orders where business_id.eq.${user.id})`)

      console.log('🗑️ Deleting customer orders...')
      const { error: customerOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('customer_id', user.id)

      console.log('🗑️ Deleting business orders...')
      const { error: businessOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('business_id', user.id)

      console.log('🗑️ Deleting referrals...')
      const { error: referralsError } = await supabase
        .from('referrals')
        .delete()
        .or(`referrer_id.eq.${user.id},referred_user_id.eq.${user.id}`)

      console.log('🗑️ Deleting subscriptions...')
      const { error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', user.id)

      // Delete user authentication from Supabase Auth (same as admin delete)
      console.log('🗑️ Deleting user authentication...')
      try {
        const authResponse = await fetch('/api/admin/delete-user-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email
          })
        })
        
        const authResult = await authResponse.json()
        
        if (authResponse.ok) {
          console.log('✅ User authentication deleted successfully')
        } else {
          console.error('❌ Failed to delete user authentication:', authResult.error)
          // Continue with profile deletion even if auth deletion fails
        }
      } catch (authError) {
        console.error('❌ Error calling auth deletion API:', authError)
        // Continue with profile deletion even if auth deletion fails
      }

      // Finally, delete the user profile (same as admin delete)
      console.log('🗑️ Deleting user profile...')
      console.log(`🔍 Attempting to delete profile with ID: ${user.id}`)
      
      const { error: profileError, data: deletedProfile } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
        .select()
      
      console.log(`🗑️ Profile deletion result:`, { 
        error: profileError, 
        deletedProfile: deletedProfile,
        deletedCount: deletedProfile?.length || 0 
      })

      // Clean up storage files (same as admin delete)
      if (storagePaths.length > 0) {
        console.log('🗑️ Cleaning up storage files...')
        
        // Delete product images from product-images bucket
        const productImagePaths = storagePaths.filter(path => !path.includes('/'))
        if (productImagePaths.length > 0) {
          const { error: productStorageError } = await supabase.storage
            .from('product-images')
            .remove(productImagePaths)
          
          if (productStorageError) {
            console.error('❌ Error deleting product images:', productStorageError)
          } else {
            console.log(`✅ Deleted ${productImagePaths.length} product images from storage`)
          }
        }
        
        // Delete other files from sharelinks bucket
        const otherPaths = storagePaths.filter(path => path.includes('/'))
        if (otherPaths.length > 0) {
          const { error: otherStorageError } = await supabase.storage
            .from('sharelinks')
            .remove(otherPaths)
          
          if (otherStorageError) {
            console.error('❌ Error deleting other files:', otherStorageError)
          } else {
            console.log(`✅ Deleted ${otherPaths.length} other files from storage`)
          }
        }
      }

      // Check for errors (same as admin delete)
      const errors = []
      if (productsError) errors.push(`Products: ${productsError.message}`)
      if (listingsError) errors.push(`Listings: ${listingsError.message}`)
      if (galleryError) errors.push(`Gallery: ${galleryError.message}`)
      if (analyticsError) errors.push(`Analytics: ${analyticsError.message}`)
      if (paymentsError) errors.push(`Payments: ${paymentsError.message}`)
      if (resetHistoryError) errors.push(`Reset History: ${resetHistoryError.message}`)
      if (profileError) errors.push(`Profile: ${profileError.message}`)
      
      // Note: Storage errors are logged but don't fail the deletion since database cleanup is more important

      if (errors.length > 0) {
        console.error('❌ Deletion errors:', errors)
        alert(`⚠️ Account deleted but with some errors:\n${errors.join('\n')}`)
      } else {
        console.log(`✅ User ${userProfile.display_name} completely deleted from database and authentication`)
        alert(`✅ Account "${userProfile.display_name}" has been completely deleted!\n\nDeleted:\n- User authentication (cannot sign in anymore)\n- ${productsToDelete} products\n- ${listingsToDelete} listings\n- ${galleryToDelete} gallery items\n- ${analyticsToDelete} analytics records\n- ${storagePaths.length} storage files\n- User profile and all data`)
      }

      // Sign out and redirect
      await signOut()
      router.push('/')

    } catch (error) {
      console.error('❌ Error deleting account:', error)
      alert(`❌ Failed to delete account: ${error}`)
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            {/* Blur Overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-amber-400 text-black font-black py-3 px-6 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                Features COMING SOON
              </div>
            </div>

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
