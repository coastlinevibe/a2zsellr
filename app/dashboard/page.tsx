'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/Button'
import { UserProfileDropdown } from '@/components/UserProfileDropdown'
import { ListingCardGrid } from '@/components/ListingCardGrid'
import FreeAccountNotifications from '@/components/FreeAccountNotifications'

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
          .from('business_gallery')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('business_products')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('business_listings')
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
              href={`/directory/${userHandle}/${profile?.subscription_tier || 'free'}`}
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
    if (galleryLoading) return renderLoadingState('gallery')

    if (!galleryItems.length) {
      return renderEmptyState(
        'No gallery items yet',
        'Spotlight your services or portfolio. Upload high-impact visuals to convert visitors faster.',
        ImageIcon,
        { label: 'Upload media', href: '/dashboard/gallery/upload' }
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gallery Showcase</h2>
            <p className="text-sm text-gray-600">Your latest visuals powering your storefront and WhatsApp funnels.</p>
          </div>
          <Button onClick={() => router.push('/dashboard/gallery/upload')} className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Add Media
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {item.image_url || item.media_url ? (
                  <img
                    src={item.image_url || item.media_url || ''}
                    alt={item.title ?? 'Gallery asset'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No media attached
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title ?? 'Untitled highlight'}</h3>
                  <span className="text-xs text-gray-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.caption ?? 'Add a caption to boost conversions.'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Ready for campaigns & storefront
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderShopTab = () => {
    if (productsLoading) return renderLoadingState('shop products')

    if (!products.length) {
      return renderEmptyState(
        'No products added',
        'Add your hero products with pricing, stock, and media to power the in-app shop and WhatsApp catalog.',
        ShoppingBag,
        { label: 'Create product', href: '/dashboard/shop/new' }
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Product Catalog</h2>
            <p className="text-sm text-gray-600">
              Manage inventory, pricing, and availability synced with your storefront.
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/shop/new')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name ?? 'Product'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name ?? 'Untitled product'}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{product.description ?? 'Add a description to increase conversions.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.price != null ? `R${product.price.toFixed(2)}` : 'Ask for price'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.stock ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Draft'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-emerald-600">
                    <button className="hover:underline" onClick={() => router.push(`/dashboard/shop/${product.id}`)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">WhatsApp Campaigns</h2>
            <p className="text-sm text-gray-600">
              Build premium WhatsApp storefronts, schedule broadcasts, and track performance.
            </p>
          </div>
          <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
            <MessageSquare className="w-4 h-4" />
            New Campaign
          </Button>
        </div>

        {renderCampaignsList()}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ultra-Premium WhatsApp Builder</h3>
            <p className="text-sm text-gray-600">Curate layout, copy, CTAs, and scheduling in one canvas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign title</label>
              <input
                value={campaignDraft.title}
                onChange={(event) => handleCampaignDraftChange('title', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Summer VIP Launch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
              <select
                value={campaignDraft.layout_type}
                onChange={(event) => handleCampaignDraftChange('layout_type', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                {layoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message template</label>
              <textarea
                value={campaignDraft.message_template}
                onChange={(event) => handleCampaignDraftChange('message_template', event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="Personalise your message with dynamic fields like {{first_name}}."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA label</label>
              <input
                value={campaignDraft.cta_label}
                onChange={(event) => handleCampaignDraftChange('cta_label', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="Shop now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA destination URL</label>
              <input
                value={campaignDraft.cta_url}
                onChange={(event) => handleCampaignDraftChange('cta_url', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={campaignDraft.scheduled_for}
                onChange={(event) => handleCampaignDraftChange('scheduled_for', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Save Campaign Draft</Button>
            <Button variant="outline">Preview in WhatsApp</Button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Draft autosaves every few minutes.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <p className="text-sm text-gray-600">See how your message renders inside the WhatsApp composer.</p>
          </div>

          <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-sm font-semibold text-emerald-900">
                A2Z
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{campaignDraft.title || 'Campaign preview'}</p>
                <span className="text-xs text-gray-500">Broadcast • {campaignDraft.layout_type.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-800 bg-white rounded-2xl p-4 border border-emerald-100">
              <p>{campaignDraft.message_template}</p>
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  Layout preview ({campaignDraft.layout_type.replace('_', ' ')})
                </div>
                <div className="p-3">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-sm font-semibold">
                    {campaignDraft.cta_label || 'CTA Button'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500 break-all">{campaignDraft.cta_url || 'https://your-url.com'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              {campaignDraft.scheduled_for
                ? `Scheduled for ${new Date(campaignDraft.scheduled_for).toLocaleString()}`
                : 'Send instantly or add a schedule above.'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leverage existing listings</h3>
            <p className="text-sm text-gray-600">
              Convert your best-performing listings into WhatsApp carousel cards in seconds.
            </p>
          </div>
        </div>

        {listingsLoading ? (
          renderLoadingState('listings')
        ) : listingCards.length ? (
          <ListingCardGrid
            listings={listingCards.map((listing) => ({
              id: listing.id,
              title: listing.title,
              category: listing.category,
              price: listing.price ?? undefined,
              image: listing.image ?? undefined,
              status: listing.status,
              views: listing.views,
              createdAt: listing.createdAt
            }))}
            viewMode={listingViewMode}
            onViewModeChange={setListingViewMode}
          />
        ) : (
          renderEmptyState(
            'No listings yet',
            'Create listings to reuse them as WhatsApp content blocks and storefront cards.',
            Building2,
            { label: 'Create listing', href: '/create' }
          )
        )}
      </div>
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
