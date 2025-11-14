'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, MapPin, CreditCard, RotateCcw, AlertTriangle, CheckCircle, Package, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { AdminPaymentDashboard } from '@/components/AdminPaymentDashboard'
import { AdminCategoriesLocations } from '@/components/AdminCategoriesLocations'
import { UserManagement } from '@/components/UserManagement'
import { BulkUploadManager } from '@/components/BulkUploadManager'
import { adminResetAllFreeUsers, previewReset, getResetStatus } from '@/lib/adminReset'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'categories' | 'bulk-upload' | 'reset'>('overview')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [resetPreview, setResetPreview] = useState<any>(null)
  const [resetStatus, setResetStatus] = useState<any>(null)
  const [resetting, setResetting] = useState(false)
  const [resetResult, setResetResult] = useState<any>(null)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    businessListings: 0,
    freeUsers: 0,
    totalProducts: 0
  })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (activeTab === 'reset') {
      loadResetData()
    }
  }, [activeTab])

  useEffect(() => {
    if (isAdmin && activeTab === 'overview') {
      loadSystemStats()
    }
  }, [isAdmin, activeTab])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/dashboard')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', user.id)
        .single()

      const adminEmails = ['admin@out.com']
      const userIsAdmin = profile?.is_admin || adminEmails.includes(user.email || '')

      if (!userIsAdmin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadResetData = async () => {
    try {
      const [previewResult, statusResult] = await Promise.all([
        previewReset(),
        getResetStatus()
      ])
      
      setResetPreview(previewResult)
      setResetStatus(statusResult)
    } catch (error) {
      console.error('Error loading reset data:', error)
    }
  }

  const handleReset = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL products, listings, and gallery items for ALL free tier users. This action CANNOT be undone. Are you absolutely sure?')) {
      return
    }

    if (!confirm('🚨 FINAL CONFIRMATION: You are about to reset ALL free tier users. Type "RESET" in the next dialog to confirm.')) {
      return
    }

    const confirmation = prompt('Type "RESET" to confirm this action:')
    if (confirmation !== 'RESET') {
      alert('Reset cancelled - confirmation text did not match.')
      return
    }

    setResetting(true)
    setResetResult(null)

    try {
      const result = await adminResetAllFreeUsers()
      setResetResult(result)
      
      if (result.success) {
        alert(`✅ Reset completed successfully!\n\n${result.data.usersReset} users reset\n${result.data.totalProductsDeleted} products deleted\n${result.data.totalListingsDeleted} listings deleted\n${result.data.totalGalleryDeleted} gallery items deleted`)
      } else {
        alert(`❌ Reset failed: ${result.message}`)
      }

      // Refresh data
      loadResetData()
    } catch (error) {
      console.error('Reset error:', error)
      alert(`❌ Reset failed: ${error}`)
    } finally {
      setResetting(false)
    }
  }

  const loadSystemStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get free users count
      const { count: freeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'free')

      // Get active subscriptions (premium + business)
      const { count: activeSubscriptions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('subscription_tier', ['premium', 'business'])

      // Get business listings count
      const { count: businessListings } = await supabase
        .from('business_listings')
        .select('*', { count: 'exact', head: true })

      // Get total products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      setSystemStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        businessListings: businessListings || 0,
        freeUsers: freeUsers || 0,
        totalProducts: totalProducts || 0
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-red-400 to-orange-500 p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white uppercase">A2Z ADMIN DASHBOARD</h1>
              <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
                FULL SYSTEM CONTROL & MANAGEMENT
              </p>
            </div>
            <motion.div
              className="bg-white p-3 rounded-lg border-2 border-black"
              whileHover={{ 
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <Shield className="w-8 h-8 text-red-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          {[
            { key: 'overview', label: 'OVERVIEW', icon: Shield, color: 'bg-blue-500' },
            { key: 'users', label: 'USERS', icon: Users, color: 'bg-green-500' },
            { key: 'payments', label: 'PAYMENTS', icon: CreditCard, color: 'bg-purple-500' },
            { key: 'categories', label: 'CATEGORIES', icon: MapPin, color: 'bg-orange-500' },
            { key: 'bulk-upload', label: 'BULK UPLOAD', icon: Upload, color: 'bg-indigo-500' },
            { key: 'reset', label: 'RESET SYSTEM', icon: RotateCcw, color: 'bg-red-500' }
          ].map(({ key, label, icon: Icon, color }) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
                activeTab === key 
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
              <motion.div
                whileHover={{ 
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              {label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <motion.div 
              className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-8 transform rotate-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-black text-black mb-6 uppercase">SYSTEM OVERVIEW</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-blue-100 p-6 rounded-xl border-2 border-black">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-black text-black uppercase">Total Users</h3>
                  <p className="text-2xl font-black text-blue-600">{systemStats.totalUsers}</p>
                </div>
                <div className="bg-green-100 p-6 rounded-xl border-2 border-black">
                  <CreditCard className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-black text-black uppercase">Active Subscriptions</h3>
                  <p className="text-2xl font-black text-green-600">{systemStats.activeSubscriptions}</p>
                </div>
                <div className="bg-purple-100 p-6 rounded-xl border-2 border-black">
                  <MapPin className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-black text-black uppercase">Business Listings</h3>
                  <p className="text-2xl font-black text-purple-600">{systemStats.businessListings}</p>
                </div>
                <div className="bg-orange-100 p-6 rounded-xl border-2 border-black">
                  <RotateCcw className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-black text-black uppercase">Free Users</h3>
                  <p className="text-2xl font-black text-orange-600">{systemStats.freeUsers}</p>
                </div>
                <div className="bg-yellow-100 p-6 rounded-xl border-2 border-black">
                  <Package className="w-8 h-8 text-yellow-600 mb-2" />
                  <h3 className="font-black text-black uppercase">Total Products</h3>
                  <p className="text-2xl font-black text-yellow-600">{systemStats.totalProducts}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'payments' && <AdminPaymentDashboard />}

          {activeTab === 'categories' && <AdminCategoriesLocations />}

          {activeTab === 'bulk-upload' && <BulkUploadManager />}

          {activeTab === 'reset' && (
            <motion.div 
              className="space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Warning Header */}
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase">FREE TIER RESET SYSTEM</h2>
                    <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
                      ⚠️ DANGER ZONE - IRREVERSIBLE ACTION
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Reset Status */}
              {resetStatus && (
                <motion.div 
                  className="bg-blue-100 p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h3 className="text-2xl font-black text-black mb-4 uppercase">CURRENT STATUS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-black text-black">FREE TIER USERS:</p>
                      <p className="text-3xl font-black text-blue-600">{resetStatus.totalFreeUsers}</p>
                    </div>
                    <div>
                      <p className="font-black text-black">LAST RESET:</p>
                      <p className="text-lg font-black text-gray-600">
                        {resetStatus.lastResetDate === 'Never' 
                          ? 'Never' 
                          : new Date(resetStatus.lastResetDate).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reset Preview */}
              {resetPreview && resetPreview.success && (
                <motion.div 
                  className="bg-yellow-100 p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-black text-black mb-4 uppercase">RESET PREVIEW</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                      <p className="font-black text-black">USERS</p>
                      <p className="text-2xl font-black text-red-600">{resetPreview.totalUsers}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                      <p className="font-black text-black">PRODUCTS</p>
                      <p className="text-2xl font-black text-red-600">{resetPreview.totalProducts}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                      <p className="font-black text-black">LISTINGS</p>
                      <p className="text-2xl font-black text-red-600">{resetPreview.totalListings}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-black text-center">
                      <p className="font-black text-black">GALLERY</p>
                      <p className="text-2xl font-black text-red-600">{resetPreview.totalGallery}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-black">
                    <h4 className="font-black text-black mb-3 uppercase">AFFECTED USERS:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {resetPreview.userBreakdown.map((user: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded border border-black">
                          <span className="font-bold text-black">{user.name}</span>
                          <span className="font-black text-red-600">
                            {user.products}P + {user.listings}L + {user.gallery}G = {user.total} items
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reset Button */}
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <motion.button
                  onClick={handleReset}
                  disabled={resetting}
                  className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                  whileHover={{ 
                    scale: resetting ? 1 : 1.05,
                    y: resetting ? 0 : -4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: resetting ? 1 : 0.95,
                    transition: { duration: 0.1 }
                  }}
                >
                  {resetting ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      RESETTING ALL FREE USERS...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-8 h-8" />
                      RESET ALL FREE TIER USERS
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Reset Result */}
              {resetResult && (
                <motion.div 
                  className={`p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${
                    resetResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {resetResult.success ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    )}
                    <h3 className="text-2xl font-black text-black uppercase">
                      {resetResult.success ? 'RESET COMPLETED' : 'RESET FAILED'}
                    </h3>
                  </div>
                  
                  <p className="font-bold text-black mb-4">{resetResult.message}</p>
                  
                  {resetResult.success && resetResult.data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
                        <p className="font-black text-black">USERS RESET</p>
                        <p className="text-xl font-black text-green-600">{resetResult.data.usersReset}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
                        <p className="font-black text-black">PRODUCTS DELETED</p>
                        <p className="text-xl font-black text-red-600">{resetResult.data.totalProductsDeleted}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
                        <p className="font-black text-black">LISTINGS DELETED</p>
                        <p className="text-xl font-black text-red-600">{resetResult.data.totalListingsDeleted}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border-2 border-black text-center">
                        <p className="font-black text-black">GALLERY DELETED</p>
                        <p className="text-xl font-black text-red-600">{resetResult.data.totalGalleryDeleted}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
