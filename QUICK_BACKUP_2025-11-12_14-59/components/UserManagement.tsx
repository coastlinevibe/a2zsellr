'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, Crown, Star, Eye, Edit, Trash2, RefreshCw, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

interface User {
  id: string
  display_name: string
  email: string
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
  is_admin: boolean
  verified_seller: boolean
  is_active: boolean
  current_listings: number
  created_at: string
  last_free_reset: string | null
  business_category: string | null
  business_location: string | null
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'business' | 'admin'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
      (filter === 'admin' && user.is_admin) ||
      (filter !== 'admin' && user.subscription_tier === filter)
    
    const matchesSearch = !searchTerm || 
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const updateUserStatus = async (userId: string, field: string, value: any) => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, [field]: value } : user
      ))
      
      alert(`✅ User ${field} updated successfully!`)
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`❌ Failed to update user ${field}`)
    } finally {
      setUpdating(null)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500'
      case 'premium': return 'bg-purple-500'
      case 'business': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Users className="w-4 h-4" />
      case 'premium': return <Star className="w-4 h-4" />
      case 'business': return <Crown className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
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
        className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white uppercase">USER MANAGEMENT</h2>
            <p className="text-white font-bold bg-black px-3 py-1 rounded border-2 border-white inline-block mt-2">
              MANAGE ALL USERS & SUBSCRIPTIONS
            </p>
          </div>
          <motion.button
            onClick={fetchUsers}
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
          className="bg-gray-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">FREE USERS</p>
              <p className="text-4xl font-black text-white">{users.filter(u => u.subscription_tier === 'free').length}</p>
            </div>
            <Users className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-purple-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">PREMIUM</p>
              <p className="text-4xl font-black text-white">{users.filter(u => u.subscription_tier === 'premium').length}</p>
            </div>
            <Star className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-green-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">BUSINESS</p>
              <p className="text-4xl font-black text-white">{users.filter(u => u.subscription_tier === 'business').length}</p>
            </div>
            <Crown className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-red-400 p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transform -rotate-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-black uppercase">ADMINS</p>
              <p className="text-4xl font-black text-white">{users.filter(u => u.is_admin).length}</p>
            </div>
            <Shield className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          {[
            { key: 'all', label: 'ALL USERS', color: 'bg-gray-500' },
            { key: 'free', label: 'FREE', color: 'bg-gray-500' },
            { key: 'premium', label: 'PREMIUM', color: 'bg-purple-500' },
            { key: 'business', label: 'BUSINESS', color: 'bg-green-500' },
            { key: 'admin', label: 'ADMINS', color: 'bg-red-500' }
          ].map(({ key, label, color }) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all ${
                filter === key 
                  ? `${color} text-white` 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {label}
            </motion.button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-black rounded-lg font-bold bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
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
                <th className="text-left p-4 font-black text-black uppercase">USER</th>
                <th className="text-left p-4 font-black text-black uppercase">TIER</th>
                <th className="text-left p-4 font-black text-black uppercase">STATUS</th>
                <th className="text-left p-4 font-black text-black uppercase">LISTINGS</th>
                <th className="text-left p-4 font-black text-black uppercase">JOINED</th>
                <th className="text-left p-4 font-black text-black uppercase">ACTIONS</th>
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
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-black text-black flex items-center gap-2">
                          {user.display_name}
                          {user.is_admin && <Shield className="w-4 h-4 text-red-500" />}
                          {user.verified_seller && <Star className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <div className="text-sm font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded border border-black inline-block">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase text-white flex items-center gap-2 ${getTierColor(user.subscription_tier)} inline-flex`}>
                      {getTierIcon(user.subscription_tier)}
                      {user.subscription_tier}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase inline-block ${
                      user.is_active && user.subscription_status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : user.is_active && user.subscription_status !== 'active'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {user.is_active 
                        ? (user.subscription_status === 'active' ? 'ACTIVE' : user.subscription_status.toUpperCase())
                        : 'INACTIVE'
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-lg text-black">{user.current_listings}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-black">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => updateUserStatus(user.id, 'is_active', !user.is_active)}
                        disabled={updating === user.id}
                        className={`p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                          user.is_active 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto transform rotate-1"
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-6 border-b-4 border-black rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase">USER DETAILS</h3>
                <motion.button
                  onClick={() => setSelectedUser(null)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">BASIC INFORMATION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-black font-bold">NAME:</span>
                    <div className="font-black text-black">{selectedUser.display_name}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">EMAIL:</span>
                    <div className="font-black text-black">{selectedUser.email}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">JOINED:</span>
                    <div className="font-black text-black">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-black font-bold">LISTINGS:</span>
                    <div className="font-black text-black">{selectedUser.current_listings}</div>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="bg-green-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">SUBSCRIPTION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-black font-bold">TIER:</span>
                    <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase text-white inline-flex items-center gap-2 ${getTierColor(selectedUser.subscription_tier)}`}>
                      {getTierIcon(selectedUser.subscription_tier)}
                      {selectedUser.subscription_tier}
                    </div>
                  </div>
                  <div>
                    <span className="text-black font-bold">STATUS:</span>
                    <div className={`px-3 py-1 rounded-lg border-2 border-black font-black text-sm uppercase inline-block ${
                      selectedUser.subscription_status === 'active' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {selectedUser.subscription_status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              {(selectedUser.business_category || selectedUser.business_location) && (
                <div className="bg-yellow-100 p-4 rounded-xl border-2 border-black">
                  <h4 className="font-black text-black mb-3 uppercase">BUSINESS INFO</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-black font-bold">CATEGORY:</span>
                      <div className="font-black text-black">{selectedUser.business_category || 'Not set'}</div>
                    </div>
                    <div>
                      <span className="text-black font-bold">LOCATION:</span>
                      <div className="font-black text-black">{selectedUser.business_location || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="bg-red-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">ADMIN ACTIONS</h4>
                <div className="flex gap-4 flex-wrap">
                  <motion.button
                    onClick={() => updateUserStatus(selectedUser.id, 'is_admin', !selectedUser.is_admin)}
                    className={`px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                      selectedUser.is_admin 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedUser.is_admin ? 'REMOVE ADMIN' : 'MAKE ADMIN'}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => updateUserStatus(selectedUser.id, 'verified_seller', !selectedUser.verified_seller)}
                    className={`px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                      selectedUser.verified_seller 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedUser.verified_seller ? 'UNVERIFY' : 'VERIFY SELLER'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
