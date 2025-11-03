'use client'

import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar,
  ExternalLink,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface Campaign {
  id: string
  title: string
  layout_type: string
  message_template: string
  target_platforms: string[]
  cta_label: string
  cta_url: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

interface MarketingCampaignsTabProps {
  onCreateNew: () => void
}

export function MarketingCampaignsTab({ onCreateNew }: MarketingCampaignsTabProps) {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaigns from database
  useEffect(() => {
    if (user?.id) {
      fetchCampaigns()
    }
  }, [user?.id])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (err: any) {
      console.error('Error fetching campaigns:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('profile_id', user?.id)

      if (error) throw error
      
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    } catch (err: any) {
      console.error('Error deleting campaign:', err)
      alert('Error deleting campaign: ' + err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLayoutIcon = (layoutType: string) => {
    switch (layoutType) {
      case 'gallery-mosaic': return '🎨'
      case 'hover-cards': return '✨'
      case 'before-after': return '🔄'
      case 'video-spotlight': return '🎥'
      case 'horizontal-slider': return '➡️'
      case 'vertical-slider': return '⬆️'
      default: return '📱'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading campaigns: {error}</div>
        <Button onClick={fetchCampaigns} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Create your first marketing campaign to start promoting your business across multiple platforms.
        </p>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create First Campaign
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Marketing Campaigns</h3>
          <p className="text-sm text-gray-600">Manage and track your multi-platform marketing campaigns</p>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getLayoutIcon(campaign.layout_type)}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{campaign.message_template}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {campaign.layout_type.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => deleteCampaign(campaign.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{campaign.target_platforms.join(', ')}</span>
                </div>
                {campaign.scheduled_for && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Scheduled: {new Date(campaign.scheduled_for).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={campaign.cta_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-xs">View Landing Page</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Edit className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Drafts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {campaigns.filter(c => c.status === 'draft').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {campaigns.filter(c => c.scheduled_for).length}
          </p>
        </div>
      </div>
    </div>
  )
}
