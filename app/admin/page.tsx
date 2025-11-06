'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Search, Edit, CheckCircle, X, CreditCard, Settings } from 'lucide-react'
import { AdminPaymentDashboard } from '@/components/AdminPaymentDashboard'
import { AdminCategoriesLocations } from '@/components/AdminCategoriesLocations'

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
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'categories'>('users')

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage users, subscriptions, and payments</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              GoTo Profile Dash
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free Tier</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.subscription_tier === 'free').length}
                </p>
              </div>
              <Badge className="bg-gray-100 text-gray-700">Free</Badge>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.subscription_tier === 'premium').length}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Business</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {users.filter(u => u.subscription_tier === 'business').length}
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Business</Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Payment Management
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-5 h-5 inline mr-2" />
                Categories & Locations
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' ? (
          <div>
            {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTier}
                            onChange={(e) => setSelectedTier(e.target.value as any)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="business">Business</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => updateUserTier(user.id, selectedTier)}
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                            className="h-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge className={getTierColor(user.subscription_tier)}>
                          {user.subscription_tier}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {user.is_admin && (
                          <Badge className="bg-red-100 text-red-700 text-xs w-fit">Admin</Badge>
                        )}
                        {user.verified_seller && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">Verified</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(user.id)
                            setSelectedTier(user.subscription_tier)
                          }}
                          disabled={editingUser === user.id}
                          className="h-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVerifiedSeller(user.id, user.verified_seller)}
                          className="h-8"
                          title={user.verified_seller ? 'Remove verified status' : 'Mark as verified'}
                        >
                          {user.verified_seller ? '✓' : '○'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'payments' ? (
          /* Payment Management Tab */
          <AdminPaymentDashboard />
        ) : (
          /* Categories & Locations Management Tab */
          <AdminCategoriesLocations />
        )}
      </div>
    </div>
  )
}
