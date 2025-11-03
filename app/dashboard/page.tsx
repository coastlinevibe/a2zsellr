'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShareBuilderPage from '@/app/share-builder/page'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Edit,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  ShoppingBag,
  Star,
  TrendingUp,
  UploadCloud,
  Users
} from 'lucide-react'

import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserProfileDropdown } from '@/components/UserProfileDropdown'
import { ListingCardGrid } from '@/components/ListingCardGrid'
import BusinessShop from '@/components/ui/business-shop'
import FreeAccountNotifications from '@/components/FreeAccountNotifications'
import { GalleryTab } from '@/components/dashboard/GalleryTab'

type SubscriptionTier = 'free' | 'premium' | 'business'
type DashboardTab = 'profile' | 'gallery' | 'shop' | 'marketing'

interface UserProfile {
  id: string
  display_name: string | null
  subscription_tier: SubscriptionTier
  verified_seller: boolean
  current_listings: number
  business_location: string | null
  business_category: string | null
}

interface GalleryItem {
  id: string | number
  title?: string | null
  caption?: string | null
  image_url?: string | null
  media_url?: string | null
  created_at?: string | null
}

interface ProductItem {
  id: string | number
  name?: string | null
  description?: string | null
  price?: number | null
  image_url?: string | null
  stock?: number | null
  created_at?: string | null
}

interface RawListing {
  id: string | number
  title?: string | null
  name?: string | null
  category?: string | null
  category_name?: string | null
  price?: number | null
  amount?: number | null
  featured_image?: string | null
  image_url?: string | null
  status?: 'active' | 'inactive' | 'pending' | string | null
  views?: number | null
  created_at?: string | null
}

interface CampaignItem {
  id: string | number
  title: string
  layout_type: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduled_for?: string | null
  created_at?: string | null
  metrics?: {
    delivered?: number
    read?: number
    clicked?: number
  }
}

type ListingCard = {
  id: string
  title: string
  category: string
  price?: number | null
  image?: string | null
  status: 'active' | 'inactive' | 'pending'
  views: number
  createdAt: string
}

type CampaignDraft = {
  title: string
  layout_type: string
  message_template: string
  cta_label: string
  cta_url: string
  scheduled_for: string
}

const dashboardTabs: { key: DashboardTab; label: string; icon: typeof Users }[] = [
  { key: 'profile', label: 'Profile', icon: Users },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'shop', label: 'Shop', icon: ShoppingBag },
  { key: 'marketing', label: 'Marketing', icon: MessageSquare }
]

const layoutOptions = [
  { value: 'gallery_mosaic', label: 'Gallery Mosaic', description: 'Showcase 6 highlights with animated tiles.' },
  { value: 'hover_cards', label: 'Hover Cards', description: 'Interactive cards with hover interactions.' },
  { value: 'slider_vertical', label: 'Vertical Slider', description: 'Story-inspired vertical slider.' },
  { value: 'slider_horizontal', label: 'Horizontal Slider', description: 'Carousel layout for product drops.' },
  { value: 'before_after', label: 'Before & After', description: 'Tell transformation stories effectively.' },
  { value: 'video_spotlight', label: 'Video Spotlight', description: 'Hero video with supporting CTAs.' }
]

const statusBadgeStyles: Record<CampaignItem['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-purple-100 text-purple-700',
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700'
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [listings, setListings] = useState<RawListing[]>([])
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [listingsLoading, setListingsLoading] = useState(false)
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [listingViewMode, setListingViewMode] = useState<'grid' | 'list'>('grid')
  const [campaignDraft, setCampaignDraft] = useState<CampaignDraft>({
    title: 'Mid-Month Growth Blast',
    layout_type: 'gallery_mosaic',
    message_template: 'Hey there! We just launched new services tailored for you. Tap to explore what’s hot this week.',
    cta_label: 'View Offers',
    cta_url: 'https://a2z-sellr.com/deals',
    scheduled_for: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login-animated')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const fetchProfile = async () => {
    try {
      if (!user?.id) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data as UserProfile)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    if (!user?.id) return

    setDashboardError(null)
    setGalleryLoading(true)
    setProductsLoading(true)
    setListingsLoading(true)
    setCampaignsLoading(true)

    try {
      const [galleryResponse, productsResponse, listingsResponse, campaignsResponse] = await Promise.all([
        supabase
          .from('profile_gallery')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profile_listings')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('whatsapp_campaigns')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (galleryResponse.error) {
        console.error('Gallery load error:', galleryResponse.error)
      } else {
        setGalleryItems((galleryResponse.data ?? []) as GalleryItem[])
      }

      if (productsResponse.error) {
        console.error('Products load error:', productsResponse.error)
      } else {
        setProducts((productsResponse.data ?? []) as ProductItem[])
      }

      if (listingsResponse.error) {
        console.error('Listings load error:', listingsResponse.error)
      } else {
        setListings((listingsResponse.data ?? []) as RawListing[])
      }

      if (campaignsResponse.error) {
        console.error('Campaigns load error:', campaignsResponse.error)
      } else {
        const normalized = (campaignsResponse.data ?? []).map((campaign) => ({
          id: campaign.id,
          title: campaign.title,
          layout_type: campaign.layout_type,
          status: campaign.status,
          scheduled_for: campaign.scheduled_for,
          created_at: campaign.created_at,
          metrics: campaign.metrics ?? {}
        })) as CampaignItem[]

        setCampaigns(normalized)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setDashboardError('We ran into an issue loading your dashboard data. Please refresh to try again.')
    } finally {
      setGalleryLoading(false)
      setProductsLoading(false)
      setListingsLoading(false)
      setCampaignsLoading(false)
    }
  }

  const handleCampaignDraftChange = (field: keyof CampaignDraft, value: string) => {
    setCampaignDraft((prev) => ({ ...prev, [field]: value }))
  }

  const getTierBadge = () => {
    if (!profile) return { text: 'Free', className: 'bg-gray-100 text-gray-700' }

    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }

    return badges[profile.subscription_tier] || badges.free
  }

  const tierBadge = getTierBadge()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'
  const userHandle = '@' + (user?.email?.split('@')[0] || 'user')

  const listingCards = useMemo<ListingCard[]>(() => {
    return listings.map((listing) => ({
      id: String(listing.id),
      title: listing.title || listing.name || 'Untitled listing',
      category: listing.category_name || listing.category || 'Uncategorised',
      price: listing.price ?? listing.amount ?? null,
      image: listing.featured_image || listing.image_url || null,
      status: ['active', 'inactive', 'pending'].includes(String(listing.status))
        ? (listing.status as 'active' | 'inactive' | 'pending')
        : 'inactive',
      views: listing.views ?? 0,
      createdAt: listing.created_at ?? ''
    }))
  }, [listings])

  const renderLoadingState = (label: string) => (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4"></div>
      <p className="text-sm text-gray-600">Loading {label}...</p>
    </div>
  )

  const renderEmptyState = (title: string, description: string, icon: typeof Users, action?: { label: string; href: string }) => {
    const IconComponent = icon
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconComponent className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        )}
      </div>
    )
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/profile"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Update Business Profile</h3>
                  <p className="text-sm text-gray-600">Keep your information fresh and verified.</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            <Link
              href="/profile"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Preview Public Profile</h3>
                  <p className="text-sm text-gray-600">Experience your listing like your customers do.</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Account & Team Settings</h3>
                  <p className="text-sm text-gray-600">Invite team members and manage billing.</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-xl border border-emerald-200 overflow-hidden">
          <div className="p-6 border-b border-emerald-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-emerald-600" />
              Upgrade Your Plan
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {profile?.subscription_tier === 'free'
                  ? 'Unlock premium galleries, marketing automation, and analytics.'
                  : profile?.subscription_tier === 'premium'
                  ? 'Go Business for multi-location support and AI marketing.'
                  : 'You are on the Business plan with full access.'}
              </h3>
              <p className="text-sm text-gray-600">
                {profile?.subscription_tier === 'free'
                  ? 'Boost conversions with advanced WhatsApp and social funnels.'
                  : profile?.subscription_tier === 'premium'
                  ? 'Scale to multiple storefronts with priority success coaching.'
                  : 'Enjoy concierge support and early access to experimental features.'}
              </p>
            </div>

            {profile?.subscription_tier !== 'business' && (
              <Button
                onClick={() => router.push('/choose-plan')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Crown className="w-4 h-4" />
                {profile?.subscription_tier === 'free' ? 'Upgrade to Premium' : 'Upgrade to Business'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">Track the latest changes made to your storefront.</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/create')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Listing
          </Button>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity yet</h3>
            <p className="text-gray-600 mb-4">
              Publish a listing, upload products, or send a campaign to start your activity feed.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Launch your first listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGalleryTab = () => {
    return (
      <GalleryTab
        galleryItems={galleryItems}
        galleryLoading={galleryLoading}
        userTier={profile?.subscription_tier || 'free'}
        onRefresh={fetchDashboardData}
      />
    )
  }

  const renderShopTab = () => {
    const handleUpgrade = (tier: string) => {
      // Redirect to upgrade page or handle subscription upgrade
      window.location.href = `/upgrade?plan=${tier}&redirect=/dashboard`
    }

    return (
      <BusinessShop 
        businessId={profile?.id || ''}
        isOwner={true}
      />
    )
  }

  const renderCampaignsList = () => {
    if (campaignsLoading) {
      return renderLoadingState('WhatsApp campaigns')
    }

    if (!campaigns.length) {
      return renderEmptyState(
        'No WhatsApp campaigns yet',
        'Use the builder to launch your first WhatsApp broadcast and track conversions in real-time.',
        MessageSquare,
        { label: 'Create campaign draft', href: '#whatsapp-builder' }
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{campaign.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{campaign.layout_type.replace('_', ' ')}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {campaign.created_at ? `Created ${new Date(campaign.created_at).toLocaleDateString()}` : 'Draft'}
              </span>
              {campaign.scheduled_for && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Scheduled {new Date(campaign.scheduled_for).toLocaleString()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-center">
              <div>
                <p className="text-xs uppercase text-gray-500">Delivered</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.metrics?.delivered ?? 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Read</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.metrics?.read ?? 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Clicked</p>
                <p className="text-sm font-semibold text-gray-900">{campaign.metrics?.clicked ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/marketing/${campaign.id}`)}>
                View Details
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Duplicate Campaign
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMarketingTab = () => (
    <div className="space-y-8" id="whatsapp-builder">
      {profile?.subscription_tier === 'free' && (
        <FreeAccountNotifications onUpgrade={() => router.push('/choose-plan')} />
      )}

      {/* Share Builder Integration */}
      <ShareBuilderPage />
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'gallery':
        return renderGalleryTab()
      case 'shop':
        return renderShopTab()
      case 'marketing':
        return renderMarketingTab()
      case 'profile':
      default:
        return renderProfileTab()
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-emerald-600">
                A2Z Sellr
              </Link>
              <Badge className={tierBadge.className}>
                {profile?.subscription_tier !== 'free' && <Crown className="w-3 h-3 mr-1" />}
                {tierBadge.text}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {displayName}!</h1>
          <p className="text-gray-600">Run your entire storefront, marketing, and growth operations from here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <Eye className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.current_listings || 0}</p>
              </div>
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Clicks</p>
                <p className="text-2xl font-bold text-gray-900">567</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Store Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {dashboardError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {dashboardError}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {dashboardTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div>{renderActiveTab()}</div>
      </div>
    </div>
  )
}
