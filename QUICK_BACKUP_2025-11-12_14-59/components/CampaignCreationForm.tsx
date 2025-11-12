'use client'

import { useState, useEffect } from 'react'
import { Save, X, Calendar, Users, MessageSquare, Image, Settings, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface SocialMediaGroup {
  id: string
  platform: 'whatsapp' | 'facebook'
  group_name: string
  member_count: number
  is_active: boolean
}

interface CampaignFormData {
  campaign_name: string
  message_content: string
  image_urls: string[]
  target_platforms: string[]
  selected_groups: string[]
  max_groups_per_day: number
  max_members_per_group_per_day: number
  is_scheduled: boolean
  schedule_type: 'once' | 'daily' | 'weekly' | 'monthly'
  start_date: string
  start_time: string
  repeat_days: number[]
  n8n_webhook_url: string
}

interface CampaignCreationFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingCampaign?: any
}

export function CampaignCreationForm({ isOpen, onClose, onSave, editingCampaign }: CampaignCreationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CampaignFormData>({
    campaign_name: '',
    message_content: '',
    image_urls: [],
    target_platforms: ['whatsapp', 'facebook'],
    selected_groups: [],
    max_groups_per_day: 50,
    max_members_per_group_per_day: 10,
    is_scheduled: false,
    schedule_type: 'weekly',
    start_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    repeat_days: [1, 2, 3, 4, 5], // Monday to Friday
    n8n_webhook_url: ''
  })
  
  const [groups, setGroups] = useState<SocialMediaGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      fetchGroups()
      if (editingCampaign) {
        setFormData({
          campaign_name: editingCampaign.campaign_name || '',
          message_content: editingCampaign.message_content || '',
          image_urls: editingCampaign.image_urls || [],
          target_platforms: editingCampaign.target_platforms || ['whatsapp', 'facebook'],
          selected_groups: [],
          max_groups_per_day: editingCampaign.max_groups_per_day || 50,
          max_members_per_group_per_day: editingCampaign.max_members_per_group_per_day || 10,
          is_scheduled: editingCampaign.is_scheduled || false,
          schedule_type: editingCampaign.schedule_type || 'weekly',
          start_date: editingCampaign.start_date || new Date().toISOString().split('T')[0],
          start_time: editingCampaign.start_time || '09:00',
          repeat_days: editingCampaign.repeat_days || [1, 2, 3, 4, 5],
          n8n_webhook_url: editingCampaign.n8n_webhook_url || ''
        })
      }
    }
  }, [isOpen, user, editingCampaign])

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_groups')
        .select('id, platform, group_name, member_count, is_active')
        .eq('profile_id', user?.id)
        .eq('is_active', true)
        .order('group_name')
      
      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      console.error('Error fetching groups:', err)
    }
  }

  const handleSave = async () => {
    if (!user || !formData.campaign_name || !formData.message_content) {
      setError('Please fill in required fields')
      return
    }

    if (formData.selected_groups.length === 0) {
      setError('Please select at least one group')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const campaignData = {
        profile_id: user.id,
        campaign_name: formData.campaign_name,
        message_content: formData.message_content,
        image_urls: formData.image_urls,
        target_platforms: formData.target_platforms,
        max_groups_per_day: formData.max_groups_per_day,
        max_members_per_group_per_day: formData.max_members_per_group_per_day,
        is_scheduled: formData.is_scheduled,
        schedule_type: formData.schedule_type,
        start_date: formData.start_date,
        start_time: formData.start_time,
        repeat_days: formData.repeat_days,
        n8n_webhook_url: formData.n8n_webhook_url || null,
        total_groups_targeted: formData.selected_groups.length,
        status: 'draft'
      }

      let campaignId: string

      if (editingCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('marketing_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id)
        
        if (error) throw error
        campaignId = editingCampaign.id
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .insert(campaignData)
          .select('id')
          .single()
        
        if (error) throw error
        campaignId = data.id
      }

      // Update campaign groups
      // First, delete existing associations if editing
      if (editingCampaign) {
        await supabase
          .from('campaign_groups')
          .delete()
          .eq('campaign_id', campaignId)
      }

      // Insert new group associations
      const campaignGroups = formData.selected_groups.map((groupId, index) => ({
        campaign_id: campaignId,
        group_id: groupId,
        priority: index + 1
      }))

      const { error: groupsError } = await supabase
        .from('campaign_groups')
        .insert(campaignGroups)

      if (groupsError) throw groupsError

      onSave()
      onClose()
      
    } catch (err: any) {
      console.error('Error saving campaign:', err)
      setError(err.message || 'Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const addImageUrl = () => {
    if (imageUrl.trim() && !formData.image_urls.includes(imageUrl.trim())) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, imageUrl.trim()]
      })
      setImageUrl('')
    }
  }

  const removeImageUrl = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index)
    })
  }

  const toggleGroup = (groupId: string) => {
    const isSelected = formData.selected_groups.includes(groupId)
    setFormData({
      ...formData,
      selected_groups: isSelected
        ? formData.selected_groups.filter(id => id !== groupId)
        : [...formData.selected_groups, groupId]
    })
  }

  const togglePlatform = (platform: string) => {
    const isSelected = formData.target_platforms.includes(platform)
    setFormData({
      ...formData,
      target_platforms: isSelected
        ? formData.target_platforms.filter(p => p !== platform)
        : [...formData.target_platforms, platform]
    })
  }

  const toggleDay = (day: number) => {
    const isSelected = formData.repeat_days.includes(day)
    setFormData({
      ...formData,
      repeat_days: isSelected
        ? formData.repeat_days.filter(d => d !== day)
        : [...formData.repeat_days, day].sort()
    })
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., Weekly Business Promotion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Platforms
                </label>
                <div className="flex gap-2">
                  {['whatsapp', 'facebook'].map((platform) => (
                    <Button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      variant={formData.target_platforms.includes(platform) ? 'default' : 'outline'}
                      size="sm"
                      className={formData.target_platforms.includes(platform) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                      {platform === 'whatsapp' ? 'WhatsApp' : 'Facebook'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Content *
              </label>
              <textarea
                value={formData.message_content}
                onChange={(e) => setFormData({...formData, message_content: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Enter your campaign message..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.message_content.length} characters
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (URLs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
                <Button onClick={addImageUrl} type="button" size="sm">
                  <Image className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm truncate max-w-xs">{url}</span>
                      <Button
                        onClick={() => removeImageUrl(index)}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Groups per Day
                </label>
                <input
                  type="number"
                  value={formData.max_groups_per_day}
                  onChange={(e) => setFormData({...formData, max_groups_per_day: parseInt(e.target.value) || 50})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Members per Group per Day
                </label>
                <input
                  type="number"
                  value={formData.max_members_per_group_per_day}
                  onChange={(e) => setFormData({...formData, max_members_per_group_per_day: parseInt(e.target.value) || 10})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="is_scheduled"
                  checked={formData.is_scheduled}
                  onChange={(e) => setFormData({...formData, is_scheduled: e.target.checked})}
                />
                <label htmlFor="is_scheduled" className="text-sm font-medium text-gray-700">
                  Schedule Campaign
                </label>
              </div>

              {formData.is_scheduled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Type
                      </label>
                      <select
                        value={formData.schedule_type}
                        onChange={(e) => setFormData({...formData, schedule_type: e.target.value as any})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {formData.schedule_type === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat Days
                      </label>
                      <div className="flex gap-2">
                        {dayNames.map((day, index) => (
                          <Button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(index + 1)}
                            variant={formData.repeat_days.includes(index + 1) ? 'default' : 'outline'}
                            size="sm"
                            className={formData.repeat_days.includes(index + 1) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* n8n Integration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n8n Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={formData.n8n_webhook_url}
                onChange={(e) => setFormData({...formData, n8n_webhook_url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="https://your-n8n-instance.com/webhook/campaign"
              />
              <p className="text-sm text-gray-500 mt-1">
                n8n webhook URL for automation triggers
              </p>
            </div>

            {/* Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Groups ({formData.selected_groups.length} selected)
              </label>
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {groups.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No active groups found. Add groups first.
                  </div>
                ) : (
                  <div className="p-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50 ${
                          formData.selected_groups.includes(group.id) ? 'bg-emerald-50 border border-emerald-200' : ''
                        }`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.selected_groups.includes(group.id)}
                            onChange={() => toggleGroup(group.id)}
                          />
                          <span className="font-medium">{group.group_name}</span>
                          <Badge className={group.platform === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {group.platform}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {group.member_count} members
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-8 pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
