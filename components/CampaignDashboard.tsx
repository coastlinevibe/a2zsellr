'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Pause, Calendar, Users, MessageSquare, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'
import { SocialMediaGroupsManager } from './SocialMediaGroupsManager'
import { CampaignCreationForm } from './CampaignCreationForm'

interface Campaign {
  id: string
  campaign_name: string
  message_content: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  target_platforms: string[]
  max_groups_per_day: number
  max_members_per_group_per_day: number
  total_groups_targeted: number
  total_posts_sent: number
  created_at: string
}

export function CampaignDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'campaigns' | 'groups'>('campaigns')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    if (user) {
      fetchCampaigns()
    }
  }, [user])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Manage your WhatsApp and Facebook marketing campaigns</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Groups
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'campaigns' ? (
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {campaigns.reduce((sum, c) => sum + c.total_posts_sent, 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Groups Targeted</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {campaigns.reduce((sum, c) => sum + c.total_groups_targeted, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Campaign</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Platforms</th>
                    <th className="text-left p-4 font-medium text-gray-900">Groups</th>
                    <th className="text-left p-4 font-medium text-gray-900">Posts Sent</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.campaign_name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.message_content}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {campaign.target_platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{campaign.total_groups_targeted}</td>
                      <td className="p-4 text-gray-600">{campaign.total_posts_sent}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setEditingCampaign(campaign)
                              setShowCreateForm(true)
                            }}
                            variant="outline" 
                            size="sm"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No campaigns found. Create your first campaign to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <SocialMediaGroupsManager />
      )}

      {/* Campaign Creation/Edit Form */}
      <CampaignCreationForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false)
          setEditingCampaign(null)
        }}
        onSave={() => {
          fetchCampaigns()
          setShowCreateForm(false)
          setEditingCampaign(null)
        }}
        editingCampaign={editingCampaign}
      />
    </div>
  )
}
