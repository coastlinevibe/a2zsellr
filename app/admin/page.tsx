'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Search, Edit, CheckCircle, X, CreditCard, Settings, LogOut } from 'lucide-react'
import { AdminPaymentDashboard } from '@/components/AdminPaymentDashboard'
import { AdminCategoriesLocations } from '@/components/AdminCategoriesLocations'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  is_admin: boolean
  verified_seller: boolean
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium' | 'business'>('free')
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'categories' | 'payment-settings'>('users')
  const [paymentEnabled, setPaymentEnabled] = useState(true)
  const [sandboxMode, setSandboxMode] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Load payment settings on component mount
  useEffect(() => {
    if (isAdmin) {
      loadPaymentSettings()
    }
  }, [isAdmin])

  const loadPaymentSettings = async () => {
    try {
      const { data: paymentSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'payment_enabled')
        .single()

      const { data: sandboxSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'sandbox_mode')
        .single()

      if (paymentSetting) {
        setPaymentEnabled(paymentSetting.value === 'true')
      }
      if (sandboxSetting) {
        setSandboxMode(sandboxSetting.value === 'true')
      }
    } catch (error) {
      console.error('Error loading payment settings:', error)
    }
  }

  const savePaymentSettings = async () => {
    setSavingSettings(true)
    try {
      // Update payment_enabled setting
      await supabase
        .from('system_settings')
        .upsert({
          key: 'payment_enabled',
          value: paymentEnabled.toString(),
          description: 'Enable or disable payment processing system'
        })

      // Update sandbox_mode setting
      await supabase
        .from('system_settings')
        .upsert({
          key: 'sandbox_mode',
          value: sandboxMode.toString(),
          description: 'Enable sandbox mode for testing payments'
        })

      alert('Payment settings saved successfully!')
    } catch (error) {
      console.error('Error saving payment settings:', error)
      alert('Error saving payment settings. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login-animated')
        return
      }

      // Check if user is admin (you can add is_admin column or check specific email)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Check if user is admin by email or is_admin flag
      const adminEmails = ['admin@out.com']
      const userIsAdmin = profile?.is_admin || adminEmails.includes(user.email || '')

      if (!userIsAdmin) {
        alert('Access denied. Admin privileges required.')
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      fetchUsers()
    } catch (error) {
      console.error('Error checking admin status:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, subscription_tier, is_admin, verified_seller, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const updateUserTier = async (userId: string, newTier: 'free' | 'premium' | 'business') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('id', userId)

      if (error) throw error

      alert(`✅ User tier updated to ${newTier}`)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user tier:', error)
      alert('❌ Failed to update user tier')
    }
  }

  const toggleVerifiedSeller = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified_seller: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      alert(`✅ Verified seller status ${!currentStatus ? 'enabled' : 'disabled'}`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating verified seller:', error)
      alert('❌ Failed to update verified seller status')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Redirect to homepage after logout
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      alert('❌ Failed to log out')
    }
  }

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'business': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-white p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                <Shield className="h-8 w-8 text-green-600" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-black text-black uppercase">ADMIN DASHBOARD</h1>
                <p className="text-sm font-bold text-black bg-white px-2 py-1 rounded border-2 border-black inline-block">
                  MANAGE USERS, SUBSCRIPTIONS & PAYMENTS
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all uppercase"
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
                PROFILE DASH
              </motion.button>
              
              <motion.button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg border-2 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 uppercase"
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
                    rotate: 180,
                    transition: { duration: 0.3 }
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </motion.div>
                LOGOUT
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-blue-400 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 transform rotate-1"
            whileHover={{ 
              scale: 1.05,
              rotate: 2,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">TOTAL USERS</p>
                <p className="text-4xl font-black text-white">{users.length}</p>
              </div>
              <motion.div 
                className="bg-white p-2 rounded-lg border-2 border-black"
                whileHover={{ 
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                <Users className="h-6 w-6 text-blue-600" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-400 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 transform -rotate-1"
            whileHover={{ 
              scale: 1.05,
              rotate: -2,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">FREE TIER</p>
                <p className="text-4xl font-black text-white">
                  {users.filter(u => u.subscription_tier === 'free').length}
                </p>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
                <span className="text-black font-black text-sm">FREE</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-purple-400 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 transform rotate-1"
            whileHover={{ 
              scale: 1.05,
              rotate: 2,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">PREMIUM</p>
                <p className="text-4xl font-black text-white">
                  {users.filter(u => u.subscription_tier === 'premium').length}
                </p>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
                <span className="text-purple-600 font-black text-sm">PREMIUM</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-green-400 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 transform -rotate-1"
            whileHover={{ 
              scale: 1.05,
              rotate: -2,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black uppercase">BUSINESS</p>
                <p className="text-4xl font-black text-white">
                  {users.filter(u => u.subscription_tier === 'business').length}
                </p>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
                <span className="text-green-600 font-black text-sm">BUSINESS</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
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
                <Users className="w-5 h-5" />
              </motion.div>
              USER MANAGEMENT
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
                activeTab === 'payments'
                  ? 'bg-green-500 text-white'
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
                <CreditCard className="w-5 h-5" />
              </motion.div>
              PAYMENT MANAGEMENT
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-purple-500 text-white'
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
                <Settings className="w-5 h-5" />
              </motion.div>
              CATEGORIES & LOCATIONS
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('payment-settings')}
              className={`px-6 py-3 rounded-xl border-4 border-black font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 ${
                activeTab === 'payment-settings'
                  ? 'bg-orange-500 text-white'
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
                <CreditCard className="w-5 h-5" />
              </motion.div>
              PAYMENT SETTINGS
            </motion.button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' ? (
          <div>
            {/* Search */}
            <motion.div 
              className="bg-yellow-300 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 mb-8 transform -rotate-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="bg-white p-3 rounded-lg border-2 border-black"
                  whileHover={{ 
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  <Search className="h-6 w-6 text-black" />
                </motion.div>
                <input
                  type="text"
                  placeholder="SEARCH BY NAME, EMAIL, OR ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-black font-bold placeholder-black bg-transparent text-lg"
                />
              </div>
            </motion.div>

            {/* Users Table */}
            <motion.div 
              className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden transform rotate-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-400 to-purple-400 border-b-4 border-black">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        USER
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        TIER
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        JOINED
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-black uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y-4 divide-black">
                    {filteredUsers.map((user, index) => (
                      <motion.tr 
                        key={user.id} 
                        className="hover:bg-yellow-100 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-black text-black">
                                {user.display_name || 'NO NAME'}
                              </div>
                              <div className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded border border-black">
                                {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-black">{user.email || 'NO EMAIL'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedTier}
                                onChange={(e) => setSelectedTier(e.target.value as any)}
                                className="text-sm border-2 border-black rounded-lg px-3 py-2 font-bold bg-white"
                              >
                                <option value="free">FREE</option>
                                <option value="premium">PREMIUM</option>
                                <option value="business">BUSINESS</option>
                              </select>
                              <motion.button
                                onClick={() => updateUserTier(user.id, selectedTier)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingUser(null)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="h-4 w-4" />
                              </motion.button>
                            </div>
                          ) : (
                            <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm ${
                              user.subscription_tier === 'free' ? 'bg-gray-400 text-black' :
                              user.subscription_tier === 'premium' ? 'bg-purple-400 text-white' :
                              'bg-green-400 text-black'
                            }`}>
                              {user.subscription_tier.toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {user.is_admin && (
                              <div className="bg-red-500 text-white px-2 py-1 rounded border-2 border-black text-xs font-black w-fit">
                                ADMIN
                              </div>
                            )}
                            {user.verified_seller && (
                              <div className="bg-blue-500 text-white px-2 py-1 rounded border-2 border-black text-xs font-black w-fit">
                                VERIFIED
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => {
                                setEditingUser(user.id)
                                setSelectedTier(user.subscription_tier)
                              }}
                              disabled={editingUser === user.id}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => toggleVerifiedSeller(user.id, user.verified_seller)}
                              className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-black ${
                                user.verified_seller 
                                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                                  : 'bg-gray-300 hover:bg-gray-400 text-black'
                              }`}
                              title={user.verified_seller ? 'Remove verified status' : 'Mark as verified'}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {user.verified_seller ? '✓' : '○'}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <motion.div 
                  className="text-center py-12 bg-gray-100 border-t-4 border-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-white p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] inline-block"
                    whileHover={{ 
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Users className="h-12 w-12 text-black mx-auto mb-4" />
                    <p className="text-black font-black uppercase">NO USERS FOUND</p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : activeTab === 'payments' ? (
          /* Payment Management Tab */
          <AdminPaymentDashboard />
        ) : activeTab === 'payment-settings' ? (
          /* Payment Settings Tab */
          <div className="space-y-8">
            {/* Header */}
            <motion.div 
              className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6 transform -rotate-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-black text-black mb-2 uppercase">PAYMENT SETTINGS</h2>
              <p className="text-black font-bold">Configure payment system settings and sandbox mode</p>
            </motion.div>

            {/* Payment Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment System Toggle */}
              <motion.div 
                className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-black mb-2">PAYMENT SYSTEM</h3>
                    <p className="text-sm text-gray-600 font-bold">Enable or disable payment processing</p>
                  </div>
                  <div className={`w-16 h-8 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer transition-all ${
                    paymentEnabled ? 'bg-green-500' : 'bg-red-500'
                  }`} onClick={() => setPaymentEnabled(!paymentEnabled)}>
                    <div className={`w-6 h-6 bg-white border-2 border-black rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-transform ${
                      paymentEnabled ? 'translate-x-8' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 border-black ${
                  paymentEnabled ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className="text-sm font-black text-black">
                    Status: {paymentEnabled ? '✅ ENABLED' : '❌ DISABLED'}
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    {paymentEnabled 
                      ? 'Users can make payments and upgrade subscriptions' 
                      : 'Payment processing is disabled - sandbox mode will be used'
                    }
                  </p>
                </div>
              </motion.div>

              {/* Sandbox Mode Toggle */}
              <motion.div 
                className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-black mb-2">SANDBOX MODE</h3>
                    <p className="text-sm text-gray-600 font-bold">Test payments without real transactions</p>
                  </div>
                  <div className={`w-16 h-8 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer transition-all ${
                    sandboxMode || !paymentEnabled ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} onClick={() => setSandboxMode(!sandboxMode)}>
                    <div className={`w-6 h-6 bg-white border-2 border-black rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-transform ${
                      sandboxMode || !paymentEnabled ? 'translate-x-8' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <div className={`p-3 rounded-lg border-2 border-black ${
                  sandboxMode || !paymentEnabled ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <p className="text-sm font-black text-black">
                    Status: {sandboxMode || !paymentEnabled ? '🧪 SANDBOX' : '🔒 PRODUCTION'}
                  </p>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    {sandboxMode || !paymentEnabled
                      ? 'Test mode - no real money will be processed'
                      : 'Live mode - real payments will be processed'
                    }
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Save Settings Button */}
            <motion.div 
              className="flex justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <button
                onClick={savePaymentSettings}
                disabled={savingSettings}
                className="px-8 py-4 bg-blue-500 text-white font-black rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSettings ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </motion.div>

            {/* Current Configuration Display */}
            <motion.div 
              className="bg-gray-100 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-lg font-black text-black mb-4">CURRENT CONFIGURATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-sm font-black text-black">Payment System</p>
                  <p className={`text-lg font-black ${paymentEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentEnabled ? 'ENABLED' : 'DISABLED'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-sm font-black text-black">Environment</p>
                  <p className={`text-lg font-black ${sandboxMode || !paymentEnabled ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {sandboxMode || !paymentEnabled ? 'SANDBOX' : 'PRODUCTION'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-sm font-black text-black">Auto-Sandbox</p>
                  <p className={`text-lg font-black ${!paymentEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {!paymentEnabled ? 'ACTIVE' : 'INACTIVE'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border-2 border-black">
                <p className="text-xs font-bold text-black">
                  💡 <strong>Note:</strong> When payment system is disabled, sandbox mode is automatically enabled for testing purposes.
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Categories & Locations Management Tab */
          <AdminCategoriesLocations />
        )}
      </div>
    </div>
  )
}
