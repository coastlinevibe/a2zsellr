'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, MessageCircle, Facebook, Users, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface SocialMediaGroup {
  id: string
  platform: 'whatsapp' | 'facebook'
  group_name: string
  group_id: string | null
  group_url: string | null
  member_count: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export function SocialMediaGroupsManager() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<SocialMediaGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<SocialMediaGroup>>({})
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'facebook' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('social_media_groups')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      console.error('Error fetching groups:', err)
      setError('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setShowAddForm(true)
    setEditingGroup(null)
    setFormData({
      platform: 'whatsapp',
      group_name: '',
      group_id: '',
      group_url: '',
      member_count: 0,
      is_active: true,
      notes: ''
    })
  }

  const handleEdit = (group: SocialMediaGroup) => {
    setEditingGroup(group.id)
    setShowAddForm(false)
    setFormData(group)
  }

  const handleSave = async () => {
    if (!user || !formData.group_name || !formData.platform) {
      setError('Please fill in required fields')
      return
    }

    setError('')
    
    try {
      if (editingGroup) {
        // Update existing group
        const { error } = await supabase
          .from('social_media_groups')
          .update({
            platform: formData.platform,
            group_name: formData.group_name,
            group_id: formData.group_id || null,
            group_url: formData.group_url || null,
            member_count: formData.member_count || 0,
            is_active: formData.is_active,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGroup)
        
        if (error) throw error
      } else {
        // Add new group
        const { error } = await supabase
          .from('social_media_groups')
          .insert({
            profile_id: user.id,
            platform: formData.platform,
            group_name: formData.group_name,
            group_id: formData.group_id || null,
            group_url: formData.group_url || null,
            member_count: formData.member_count || 0,
            is_active: formData.is_active,
            notes: formData.notes || null
          })
        
        if (error) throw error
      }

      // Reset form and refresh data
      setEditingGroup(null)
      setShowAddForm(false)
      setFormData({})
      fetchGroups()
      
    } catch (err: any) {
      console.error('Error saving group:', err)
      setError(err.message || 'Failed to save group')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return
    
    try {
      const { error } = await supabase
        .from('social_media_groups')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchGroups()
      
    } catch (err: any) {
      console.error('Error deleting group:', err)
      setError(err.message || 'Failed to delete group')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('social_media_groups')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      fetchGroups()
      
    } catch (err: any) {
      console.error('Error toggling status:', err)
      setError(err.message || 'Failed to update status')
    }
  }

  const handleCancel = () => {
    setEditingGroup(null)
    setShowAddForm(false)
    setFormData({})
    setError('')
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />
      default:
        return <Users className="w-4 h-4 text-gray-600" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return 'bg-green-100 text-green-800'
      case 'facebook':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredGroups = groups.filter(group => {
    switch (filter) {
      case 'whatsapp':
        return group.platform === 'whatsapp'
      case 'facebook':
        return group.platform === 'facebook'
      case 'active':
        return group.is_active
      case 'inactive':
        return !group.is_active
      default:
        return true
    }
  })

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
          <h2 className="text-2xl font-bold text-gray-900">Social Media Groups</h2>
          <p className="text-gray-600">Manage your WhatsApp and Facebook groups for campaigns</p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">WhatsApp</p>
              <p className="text-2xl font-bold text-green-600">
                {groups.filter(g => g.platform === 'whatsapp').length}
              </p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facebook</p>
              <p className="text-2xl font-bold text-blue-600">
                {groups.filter(g => g.platform === 'facebook').length}
              </p>
            </div>
            <Facebook className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-emerald-600">
                {groups.filter(g => g.is_active).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'whatsapp', 'facebook', 'active', 'inactive'].map((filterOption) => (
          <Button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            className={filter === filterOption ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingGroup) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingGroup ? 'Edit Group' : 'Add New Group'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
              <select
                value={formData.platform || 'whatsapp'}
                onChange={(e) => setFormData({...formData, platform: e.target.value as 'whatsapp' | 'facebook'})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <input
                type="text"
                value={formData.group_name || ''}
                onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Business Network SA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
              <input
                type="text"
                value={formData.group_id || ''}
                onChange={(e) => setFormData({...formData, group_id: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Platform-specific group ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group URL</label>
              <input
                type="url"
                value={formData.group_url || ''}
                onChange={(e) => setFormData({...formData, group_url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Count</label>
              <input
                type="number"
                value={formData.member_count || 0}
                onChange={(e) => setFormData({...formData, member_count: parseInt(e.target.value) || 0})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active || false}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Additional notes about this group..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Platform</th>
                <th className="text-left p-4 font-medium text-gray-900">Group Name</th>
                <th className="text-left p-4 font-medium text-gray-900">Members</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">URL</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(group.platform)}
                      <Badge className={getPlatformColor(group.platform)}>
                        {group.platform}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{group.group_name}</p>
                      {group.notes && (
                        <p className="text-sm text-gray-500">{group.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{group.member_count.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {group.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    {group.group_url ? (
                      <a 
                        href={group.group_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleActive(group.id, group.is_active)}
                        variant="outline"
                        size="sm"
                        title={group.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {group.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleEdit(group)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(group.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No groups found. Click "Add Group" to get started.'
              : `No ${filter} groups found.`
            }
          </p>
        </div>
      )}
    </div>
  )
}
