'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, Crown, Star, Eye, Edit, Trash2, RefreshCw, Search } from 'lucide-react'
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
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
    setSelectAll(newSelected.size === filteredUsers.length)
  }

  const loginAsUser = async (userId: string, userName: string) => {
    if (!confirm(`🔑 Login as "${userName}"?\n\nThis will log you into their account and redirect to their dashboard.`)) {
      return
    }

    setUpdating(userId)
    try {
      const response = await fetch('/api/admin/login-as-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName })
      })

      const result = await response.json()

      if (response.ok) {
        if (result.method === 'magic_link' && result.loginUrl) {
          // For users with authentication, use the magic link
          alert(`✅ Logged in as "${userName}"! Redirecting to their dashboard...`)
          window.location.href = result.loginUrl
        } else if (result.method === 'admin_impersonation') {
          // For users without authentication (bulk uploaded), redirect to dashboard with impersonation
          alert(`✅ Impersonating "${userName}"! Redirecting to their dashboard...`)
          window.location.href = '/dashboard'
        } else {
          alert(`✅ Logged in as "${userName}"! Redirecting...`)
          window.location.href = '/dashboard'
        }
      } else {
        alert(`❌ Failed: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`)
    } finally {
      setUpdating(null)
    }
  }

  const bulkDeleteSelectedUsers = async () => {
    if (selectedUsers.size === 0) {
      alert('⚠️ Please select users to delete first.')
      return
    }

    const selectedUsersList = users.filter(user => selectedUsers.has(user.id))
    const userNames = selectedUsersList.map(u => u.display_name).join(', ')
    
    console.log(`🚨 BULK DELETE SELECTED USERS CALLED: ${selectedUsers.size} users`)
    
    // Strict confirmation for bulk deletion
    if (!confirm(`🚨 WARNING: You are about to DELETE ${selectedUsers.size} selected users and ALL their data:\n\n${userNames}\n\nThis will:\n- Delete their accounts and authentication\n- Delete ALL their products, listings, and gallery items\n- Delete ALL their payment records and analytics\n- Delete ALL their data permanently\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?`)) {
      console.log('❌ User cancelled at first confirmation')
      return
    }

    if (!confirm(`🚨 FINAL WARNING: This will permanently delete ${selectedUsers.size} users and all their data.\n\nType "DELETE SELECTED" in the next dialog to confirm.`)) {
      console.log('❌ User cancelled at second confirmation')
      return
    }

    const confirmation = prompt(`Type "DELETE SELECTED" to permanently delete ${selectedUsers.size} selected users:`)
    if (confirmation !== 'DELETE SELECTED') {
      console.log(`❌ User typed "${confirmation}" instead of "DELETE SELECTED"`)
      alert('Bulk deletion cancelled - confirmation text did not match.')
      return
    }

    console.log('✅ All confirmations passed, starting bulk deletion...')
    setLoading(true)
    
    try {
      console.log(`🗑️ Starting bulk deletion of ${selectedUsers.size} selected users...`)

      const selectedUserIds = Array.from(selectedUsers)
      
      // Delete all data for selected users in sequence (order matters due to foreign keys)
      console.log('🗑️ Deleting selected users profile products...')
      const { error: productsError } = await supabase
        .from('profile_products')
        .delete()
        .in('profile_id', selectedUserIds)

      console.log('🗑️ Deleting selected users profile listings...')
      const { error: listingsError } = await supabase
        .from('profile_listings')
        .delete()
        .in('profile_id', selectedUserIds)

      console.log('🗑️ Deleting selected users profile gallery...')
      const { error: galleryError } = await supabase
        .from('profile_gallery')
        .delete()
        .in('profile_id', selectedUserIds)

      console.log('🗑️ Deleting selected users profile analytics...')
      const { error: analyticsError } = await supabase
        .from('profile_analytics')
        .delete()
        .in('profile_id', selectedUserIds)

      console.log('🗑️ Deleting selected users payment transactions...')
      const { error: paymentsError } = await supabase
        .from('payment_transactions')
        .delete()
        .in('profile_id', selectedUserIds)

      console.log('🗑️ Deleting selected users reset history...')
      const { error: resetHistoryError } = await supabase
        .from('reset_history')
        .delete()
        .in('profile_id', selectedUserIds)

      // Delete selected user authentication via API
      console.log('🗑️ Deleting selected user authentication...')
      try {
        const authResponse = await fetch('/api/admin/bulk-delete-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: selectedUserIds,
            userEmails: selectedUsersList.map(u => u.email)
          })
        })
        
        const authResult = await authResponse.json()
        
        if (authResponse.ok) {
          console.log('✅ Selected user authentication deleted successfully')
        } else {
          console.error('❌ Failed to delete selected user authentication:', authResult.error)
        }
      } catch (authError) {
        console.error('❌ Error calling bulk auth deletion API:', authError)
      }

      // Finally, delete selected user profiles
      console.log('🗑️ Deleting selected user profiles...')
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('id', selectedUserIds)

      // Check for errors
      const errors = []
      if (productsError) errors.push(`Products: ${productsError.message}`)
      if (listingsError) errors.push(`Listings: ${listingsError.message}`)
      if (galleryError) errors.push(`Gallery: ${galleryError.message}`)
      if (analyticsError) errors.push(`Analytics: ${analyticsError.message}`)
      if (paymentsError) errors.push(`Payments: ${paymentsError.message}`)
      if (resetHistoryError) errors.push(`Reset History: ${resetHistoryError.message}`)
      if (profilesError) errors.push(`Profiles: ${profilesError.message}`)

      if (errors.length > 0) {
        console.error('❌ Bulk deletion errors:', errors)
        alert(`⚠️ Bulk deletion completed but with some errors:\n${errors.join('\n')}`)
      } else {
        console.log(`✅ ${selectedUsers.size} selected users and their data completely deleted`)
        alert(`✅ BULK DELETION COMPLETE!\n\nDeleted ${selectedUsers.size} users:\n${userNames}\n\nAll their products, listings, gallery items, payment records, and authentication have been permanently removed.`)
      }

      // Remove deleted users from local state
      setUsers(users.filter(user => !selectedUsers.has(user.id)))
      setSelectedUsers(new Set())
      setSelectAll(false)
      setSelectedUser(null)

    } catch (error) {
      console.error('❌ Error during bulk deletion:', error)
      alert(`❌ Failed to complete bulk deletion: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    console.log(`🚨 DELETE USER CALLED: ${userId} (${userName})`)
    
    // Triple confirmation for user deletion
    if (!confirm(`🚨 WARNING: You are about to PERMANENTLY DELETE user "${userName}" and ALL their data. This action CANNOT be undone. Are you absolutely sure?`)) {
      console.log('❌ User cancelled at first confirmation')
      return
    }

    if (!confirm(`🚨 FINAL WARNING: This will delete:\n- User profile and authentication\n- All products and listings\n- All gallery images\n- All analytics data\n- All payment records\n- ALL user data permanently\n\nType "DELETE" in the next dialog to confirm.`)) {
      console.log('❌ User cancelled at second confirmation')
      return
    }

    const confirmation = prompt(`Type "DELETE" to permanently remove user "${userName}":`)
    if (confirmation !== 'DELETE') {
      console.log(`❌ User typed "${confirmation}" instead of "DELETE"`)
      alert('User deletion cancelled - confirmation text did not match.')
      return
    }

    console.log('✅ All confirmations passed, starting deletion...')
    setUpdating(userId)
    try {
      console.log(`🗑️ Starting complete deletion of user: ${userId} (${userName})`)

      // First, let's verify the user exists and we can access it
      const { data: userProfile, error: userReadError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('id', userId)
        .single()
      
      console.log(`🔍 User profile check:`, { 
        userProfile, 
        userReadError,
        canReadUser: !!userProfile 
      })

      if (userReadError) {
        console.error('❌ Cannot read user profile:', userReadError)
        alert(`❌ Cannot access user profile: ${userReadError.message}`)
        return
      }

      // First, let's get all user data that contains storage files
      const { data: existingProducts, error: productsReadError } = await supabase
        .from('profile_products')
        .select('id, name, profile_id, image_url, images')
        .eq('profile_id', userId)
      
      const { data: existingGallery, error: galleryReadError } = await supabase
        .from('profile_gallery')
        .select('id, image_url, storage_path')
        .eq('profile_id', userId)
      
      console.log(`🔍 Found ${existingProducts?.length || 0} products for user ${userId}:`, existingProducts)
      console.log(`🔍 Found ${existingGallery?.length || 0} gallery items for user ${userId}:`, existingGallery)
      
      if (productsReadError) {
        console.error('❌ Error reading products:', productsReadError)
      }
      if (galleryReadError) {
        console.error('❌ Error reading gallery:', galleryReadError)
      }

      // Extract all storage paths that need to be deleted
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

      // Count items before deletion for logging
      const [productsCount, listingsCount, galleryCount, analyticsCount] = await Promise.all([
        supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', userId),
        supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', userId),
        supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', userId),
        supabase.from('profile_analytics').select('id', { count: 'exact' }).eq('profile_id', userId)
      ])

      const productsToDelete = productsCount.count || 0
      const listingsToDelete = listingsCount.count || 0
      const galleryToDelete = galleryCount.count || 0
      const analyticsToDelete = analyticsCount.count || 0

      console.log(`📊 Items to delete: ${productsToDelete} products, ${listingsToDelete} listings, ${galleryToDelete} gallery, ${analyticsToDelete} analytics`)

      // Delete all user-related data in sequence
      console.log('🗑️ Deleting user products...')
      const { error: productsError, data: deletedProducts } = await supabase
        .from('profile_products')
        .delete()
        .eq('profile_id', userId)
        .select()
      
      console.log(`🗑️ Products deletion result:`, { error: productsError, deletedCount: deletedProducts?.length || 0 })

      console.log('🗑️ Deleting user listings...')
      const { error: listingsError } = await supabase
        .from('profile_listings')
        .delete()
        .eq('profile_id', userId)

      console.log('🗑️ Deleting user gallery...')
      const { error: galleryError } = await supabase
        .from('profile_gallery')
        .delete()
        .eq('profile_id', userId)

      console.log('🗑️ Deleting user analytics...')
      const { error: analyticsError } = await supabase
        .from('profile_analytics')
        .delete()
        .eq('profile_id', userId)

      // Try to delete from other possible tables
      console.log('🗑️ Deleting payment transactions...')
      const { error: paymentsError } = await supabase
        .from('payment_transactions')
        .delete()
        .eq('profile_id', userId)

      console.log('🗑️ Deleting reset history...')
      const { error: resetHistoryError } = await supabase
        .from('reset_history')
        .delete()
        .eq('profile_id', userId)



      // Delete user authentication from Supabase Auth
      console.log('🗑️ Deleting user authentication...')
      try {
        const authResponse = await fetch('/api/admin/delete-user-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            userEmail: userProfile.email
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

      // Finally, delete the user profile
      console.log('🗑️ Deleting user profile...')
      console.log(`🔍 Attempting to delete profile with ID: ${userId}`)
      
      const { error: profileError, data: deletedProfile } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select()
      
      console.log(`🗑️ Profile deletion result:`, { 
        error: profileError, 
        deletedProfile: deletedProfile,
        deletedCount: deletedProfile?.length || 0 
      })

      // Clean up storage files
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

      // Check for errors
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
        alert(`⚠️ User deleted but with some errors:\n${errors.join('\n')}`)
      } else {
        console.log(`✅ User ${userName} completely deleted from database and authentication`)
        alert(`✅ User "${userName}" has been completely deleted!\n\nDeleted:\n- User authentication (cannot sign in anymore)\n- ${productsToDelete} products\n- ${listingsToDelete} listings\n- ${galleryToDelete} gallery items\n- ${analyticsToDelete} analytics records\n- ${storagePaths.length} storage files\n- User profile and all data`)
      }

      // Remove from local state
      setUsers(users.filter(user => user.id !== userId))
      setSelectedUser(null)

    } catch (error) {
      console.error('❌ Error deleting user:', error)
      alert(`❌ Failed to delete user: ${error}`)
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
        
        <div className="flex gap-4 items-center">
          {/* Bulk Delete Button */}
          <motion.button
            onClick={bulkDeleteSelectedUsers}
            disabled={selectedUsers.size === 0}
            className={`px-6 py-2 rounded-xl border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] flex items-center gap-2 ${
              selectedUsers.size === 0 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            whileHover={{ scale: selectedUsers.size === 0 ? 1 : 1.05 }}
            whileTap={{ scale: selectedUsers.size === 0 ? 1 : 0.95 }}
          >
            <Trash2 className="w-4 h-4" />
            DELETE ({selectedUsers.size})
          </motion.button>
          
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
                <th className="text-left p-4 font-black text-black uppercase">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-5 h-5 border-2 border-black rounded"
                  />
                </th>
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
                  className={`hover:bg-yellow-100 transition-colors ${
                    selectedUsers.has(user.id) ? 'bg-blue-100' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-5 h-5 border-2 border-black rounded"
                    />
                  </td>
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
                        onClick={() => {
                          const profileSlug = user.display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                          window.open(`/profile/${profileSlug}`, '_blank')
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Profile Page"
                      >
                        👤
                      </motion.button>

                      <motion.button
                        onClick={() => loginAsUser(user.id, user.display_name)}
                        disabled={updating === user.id}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Login As User"
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          '🔑'
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => updateUserStatus(user.id, 'is_active', !user.is_active)}
                        disabled={updating === user.id}
                        className={`p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] ${
                          user.is_active 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
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

                      <motion.button
                        onClick={() => deleteUser(user.id, user.display_name)}
                        disabled={updating === user.id}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="🚨 DELETE USER PERMANENTLY"
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
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

              {/* Subscription Management */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-black">
                <h4 className="font-black text-black mb-3 uppercase">SUBSCRIPTION MANAGEMENT</h4>
                <div className="space-y-4">
                  
                  {/* General Tier Change */}
                  <motion.button
                    onClick={async () => {
                      const newTier = selectedUser.subscription_tier === 'free' ? 'premium' : 
                                    selectedUser.subscription_tier === 'premium' ? 'business' : 'free'
                      
                      if (confirm(`Change ${selectedUser.display_name}'s subscription from ${selectedUser.subscription_tier} to ${newTier}?`)) {
                        await updateUserStatus(selectedUser.id, 'subscription_tier', newTier)
                        if (newTier !== 'free') {
                          await updateUserStatus(selectedUser.id, 'trial_end_date', null)
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] bg-blue-500 hover:bg-blue-600 text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    MANUAL TIER CHANGE
                  </motion.button>
                  
                  <motion.button
                    onClick={async () => {
                      if (confirm(`Activate business subscription for ${selectedUser.display_name}? This will set them to business tier and remove trial restrictions.`)) {
                        try {
                          const { error } = await supabase
                            .from('profiles')
                            .update({
                              subscription_tier: 'business',
                              subscription_status: 'active',
                              trial_end_date: null,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', selectedUser.id)
                          
                          if (error) throw error
                          
                          // Note: admin_payment_overview is a view, so we can't update it directly
                          // The payment status will be reflected through the underlying tables
                          console.log('ℹ️ Payment status will be reflected in admin_payment_overview view')
                          
                          alert('✅ Business subscription activated!')
                          setUsers(users.map(user => 
                            user.id === selectedUser.id 
                              ? { ...user, subscription_tier: 'business', subscription_status: 'active', trial_end_date: null }
                              : user
                          ))
                          setSelectedUser(prev => prev ? { ...prev, subscription_tier: 'business', subscription_status: 'active' } : null)
                        } catch (error) {
                          console.error('Error activating subscription:', error)
                          alert('❌ Failed to activate subscription')
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] bg-blue-500 hover:bg-blue-600 text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ACTIVATE BUSINESS
                  </motion.button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-200 p-4 rounded-xl border-4 border-red-600">
                <h4 className="font-black text-red-800 mb-3 uppercase flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  DANGER ZONE
                </h4>
                <p className="text-red-700 font-bold mb-4">
                  ⚠️ This action will PERMANENTLY DELETE the user and ALL their data. This cannot be undone!
                </p>
                <motion.button
                  onClick={() => deleteUser(selectedUser.id, selectedUser.display_name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 className="w-5 h-5" />
                  🚨 DELETE USER PERMANENTLY
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
