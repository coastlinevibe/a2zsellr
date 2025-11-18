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
  BarChart3,
  Share2,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TierLimitDisplay } from '@/components/ui/premium-badge'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface Listing {
  id: string
  title: string
  layout_type: string
  message_template: string
  target_platforms: string[]
  cta_label: string
  cta_url: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled'
  scheduled_for: string | null
  created_at: string
  updated_at: string
  uploaded_media?: Array<{
    id: string
    name: string
    url: string
    type: string
    storage_path?: string
  }>
  selected_products?: string[]
}

interface MarketingCampaignsTabProps {
  onCreateNew: () => void
  onEditListing?: (listing: Listing) => void
  userTier?: 'free' | 'premium' | 'business'
  businessProfile?: {
    display_name: string | null
    id: string
  }
}

export function MarketingCampaignsTab({ onCreateNew, onEditListing, userTier = 'free', businessProfile }: MarketingCampaignsTabProps) {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    totalClicks: 0
  })

  // Fetch campaigns from database
  useEffect(() => {
    if (user?.id) {
      fetchListings()
    }
  }, [user?.id])

  const fetchListings = async () => {
    try {
      setLoading(true)
      
      // Fetch listings
      const { data, error } = await supabase
        .from('profile_listings')
        .select('*')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])

      // Fetch analytics data
      const { data: analyticsData } = await supabase
        .from('profile_analytics')
        .select('views, clicks')
        .eq('profile_id', user?.id)

      // Sum up all views and clicks
      const totalViews = analyticsData?.reduce((sum, record) => sum + record.views, 0) || 0
      const totalClicks = analyticsData?.reduce((sum, record) => sum + record.clicks, 0) || 0
      
      setAnalyticsData({
        totalViews,
        totalClicks
      })

    } catch (err: any) {
      console.error('Error fetching listings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const { error } = await supabase
        .from('profile_listings')
        .delete()
        .eq('id', listingId)
        .eq('profile_id', user?.id)

      if (error) throw error
      
      // Update local state
      const updatedListings = listings.filter(c => c.id !== listingId)
      setListings(updatedListings)
      
      // If no listings remain, reset all analytics data
      if (updatedListings.length === 0) {
        await Promise.all([
          // Reset profile views
          supabase
            .from('profiles')
            .update({ 
              profile_views: 0,
              last_view_reset: new Date().toISOString()
            })
            .eq('id', user?.id),
          
          // Clear all analytics data
          supabase
            .from('profile_analytics')
            .delete()
            .eq('profile_id', user?.id)
        ])
        
        // Update local analytics state
        setAnalyticsData({
          totalViews: 0,
          totalClicks: 0
        })
        
        console.log('✅ All analytics data cleared - no listings remaining')
      }
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      alert('Error deleting listing: ' + err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
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

  const getListingUrl = (listing: Listing) => {
    const baseUrl = 'https://a2zsellr.life'
    const displayName = businessProfile?.display_name || 'business'
    const usernameSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    // Use url_slug if available, otherwise generate from title
    const listingSlug = (listing as any).url_slug || listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return `${baseUrl}/${usernameSlug}/${listingSlug}`
  }

  const copyListingLink = async (listing: Listing) => {
    const shareUrl = getListingUrl(listing)
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('✅ Link copied to clipboard!\n\n' + shareUrl + '\n\nYou can now paste this link anywhere!')
    } catch (err) {
      // Fallback if clipboard API fails
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('✅ Link copied to clipboard!\n\n' + shareUrl + '\n\nYou can now paste this link anywhere!')
      } catch (e) {
        alert('Copy this link:\n\n' + shareUrl)
      }
      document.body.removeChild(textArea)
    }
  }

  const shareListing = async (listing: Listing) => {
    const shareUrl = getListingUrl(listing)

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.message_template,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      copyListingLink(listing)
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
        <Button onClick={fetchListings} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  // Tier limits
  const TIER_LIMITS = {
    free: 3,
    premium: 999,
    business: 999
  }
  const currentLimit = TIER_LIMITS[userTier]
  const isAtLimit = listings.length >= currentLimit && userTier === 'free'

  const handleCreateNew = () => {
    if (isAtLimit) {
      alert(`Free tier is limited to ${currentLimit} listings. You currently have ${listings.length}. Please upgrade to create more listings.`)
      return
    }
    onCreateNew()
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Create your first business listing to showcase your products and services.
        </p>
        {userTier === 'free' && (
          <p className="text-sm text-amber-600 mb-4 font-medium">
            Free tier: Create up to {currentLimit} listings
          </p>
        )}
        <button 
          onClick={handleCreateNew} 
          className="bg-blue-500 text-white px-6 py-3 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600 transition-all"
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          Create First Listing
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 rounded-full p-1 border-2 border-black">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-black">Total Listings</span>
          </div>
          <p className="text-2xl font-black text-black">{listings.length}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-600 rounded-full p-1 border-2 border-black">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-black">Listings Viewed</span>
          </div>
          <p className="text-2xl font-black text-black">
            {analyticsData.totalViews.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-600 rounded-full p-1 border-2 border-black">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-black">Listings Clicked</span>
          </div>
          <p className="text-2xl font-black text-black">
            {analyticsData.totalClicks.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-orange-100 p-4 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-600 rounded-full p-1 border-2 border-black">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-black">Listings Scheduled</span>
          </div>
          <p className="text-2xl font-black text-black">
            {listings.filter(c => c.scheduled_for).length}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Business Listings</h3>
          <TierLimitDisplay 
            current={listings.length}
            limit={currentLimit}
            tier={userTier}
            itemName="listings"
            size="md"
          />
        </div>
        <button 
          onClick={handleCreateNew} 
          disabled={isAtLimit}
          className={`px-6 py-3 rounded-[9px] border-2 border-black font-bold transition-all ${
            isAtLimit 
              ? 'bg-gray-300 text-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] cursor-not-allowed'
              : 'bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600'
          }`}
        >
          <Plus className="w-5 h-5 mr-2 inline" />
          {isAtLimit ? 'Limit Reached' : 'New Listing'}
        </button>
      </div>

      {/* Free Tier Limit Warning */}
      {userTier === 'free' && isAtLimit && (
        <div className="bg-amber-100 border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 rounded-full p-2 border-2 border-black">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-black">Listing Limit Reached</h4>
              <p className="text-sm font-bold text-black mt-1">
                You've reached the {currentLimit}-listing limit for free accounts. Upgrade to Premium for unlimited listings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getLayoutIcon(listing.layout_type)}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{listing.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{listing.message_template}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {listing.layout_type.replace('-', ' ')}
                    </span>
                    {listing.uploaded_media && listing.uploaded_media.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {listing.uploaded_media.length} media
                      </span>
                    )}
                    {listing.selected_products && listing.selected_products.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {listing.selected_products.length} products
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => window.open(getListingUrl(listing), '_blank')}
                  className="bg-white text-black px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-xs hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] transition-all"
                >
                  <Eye className="w-3 h-3 mr-1 inline" />
                  Preview
                </button>
                <button 
                  onClick={() => shareListing(listing)}
                  title="Share this listing"
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-xs hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-green-200 transition-all"
                >
                  <Share2 className="w-3 h-3 mr-1 inline" />
                  Share
                </button>
                <button 
                  onClick={() => {
                    if (onEditListing) {
                      onEditListing(listing)
                    } else {
                      // Fallback: switch to builder tab
                      onCreateNew()
                      alert('📝 Edit functionality: Please implement onEditListing prop to enable editing.')
                    }
                  }}
                  className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-xs hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-yellow-200 transition-all"
                >
                  <Edit className="w-3 h-3 mr-1 inline" />
                  Edit
                </button>
                <button 
                  onClick={() => deleteListing(listing.id)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-xs hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-red-200 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{listing.target_platforms.join(', ')}</span>
                  </div>
                  {listing.scheduled_for && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Scheduled: {new Date(listing.scheduled_for).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Listing URL Display */}
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <code className="text-xs text-blue-600 font-mono flex-1 truncate">
                  {getListingUrl(listing)}
                </code>
                <button
                  onClick={() => copyListingLink(listing)}
                  className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
