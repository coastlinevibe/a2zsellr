'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShareLinkBuilder from '@/components/ui/share-link-builder'
import CampaignScheduler from '@/components/ui/campaign-scheduler'
import AnalyticsDashboard from '@/components/ui/analytics-dashboard'
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
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  X,
  Clipboard
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
import { MarketingCampaignsTab } from '@/components/dashboard/MarketingCampaignsTab'
import PublicProfilePreview from '@/components/ui/public-profile-preview'

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
  email: string | null
  avatar_url: string | null
  bio: string | null
  phone_number: string | null
  website_url: string | null
}

const dashboardTabs: { key: DashboardTab; label: string; icon: typeof Users }[] = [
  { key: 'profile', label: 'Profile', icon: Users },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'shop', label: 'Shop', icon: ShoppingBag },
  { key: 'marketing', label: 'Marketing', icon: MessageSquare }
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile')
  
  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  
  // Marketing tab state (properly at top level)
  const [marketingActiveView, setMarketingActiveView] = useState('builder')
  const [marketingProducts, setMarketingProducts] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login-animated')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  // Gallery data fetch
  useEffect(() => {
    const fetchGalleryData = async () => {
      if (!profile?.id) return
      
      setGalleryLoading(true)
      try {
        const { data, error } = await supabase
          .from('profile_gallery')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setGalleryItems(data || [])
        console.log('📸 Gallery items loaded:', data?.length || 0)
      } catch (error) {
        console.error('Error fetching gallery:', error)
      } finally {
        setGalleryLoading(false)
      }
    }

    if (profile?.id) {
      fetchGalleryData()
    }
  }, [profile?.id])

  // Marketing products fetch (properly at top level)
  useEffect(() => {
    const fetchMarketingProducts = async () => {
      if (!profile?.id) return
      
      try {
        const { data, error } = await supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', profile.id)
          .limit(10)

        if (error) throw error
        setMarketingProducts(data || [])
      } catch (error) {
        console.error('Error fetching marketing products:', error)
      }
    }

    if (profile?.id) {
      fetchMarketingProducts()
    }
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

  const getTierBadge = () => {
    if (!profile) return { text: 'Free', className: 'bg-gray-100 text-gray-700' }

    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Pro', className: 'bg-blue-100 text-blue-700' }
    }

    return badges[profile.subscription_tier] || badges.free
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 overflow-hidden max-w-md">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Profile Management</h2>
          </div>
          <div className="p-3">
            <Link
              href="/profile"
              className="flex items-center justify-between p-2 bg-gray-50 rounded-[9px] hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-gray-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Update Business Profile</h3>
                  <p className="text-xs text-gray-600">Keep your information fresh and verified.</p>
                </div>
              </div>
              <div className="text-gray-400 text-sm">→</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Public Profile Preview */}
      {profile && (
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Public Profile Preview</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">This is how visitors see your profile when they click on your listing card</p>
          </div>
          <div className="p-6">
            <PublicProfilePreview profile={profile} />
          </div>
        </div>
      )}
    </div>
  )

  const renderMarketingTab = () => {
    const marketingViews = [
      { id: 'builder', label: 'Campaign Builder', icon: Plus },
      { id: 'campaigns', label: 'My Listings', icon: MessageSquare },
      { id: 'scheduler', label: 'Scheduler', icon: Calendar },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp }
    ]

    return (
      <div className="space-y-8" id="whatsapp-builder">
        {profile?.subscription_tier === 'free' && (
          <FreeAccountNotifications onUpgrade={() => router.push('/choose-plan')} />
        )}

        {/* Marketing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <MessageSquare className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Marketing Tools */}
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {marketingViews.map((view) => {
                const IconComponent = view.icon
                return (
                  <button
                    key={view.id}
                    onClick={() => setMarketingActiveView(view.id)}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                      marketingActiveView === view.id
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {view.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {marketingActiveView === 'builder' && (
              <ShareLinkBuilder products={marketingProducts} businessProfile={profile} />
            )}

            {marketingActiveView === 'campaigns' && (
              <MarketingCampaignsTab onCreateNew={() => setMarketingActiveView('builder')} />
            )}

            {marketingActiveView === 'scheduler' && (
              <CampaignScheduler onSchedule={(settings) => {
                console.log('Campaign scheduled:', settings)
                alert('🎉 Campaign scheduled successfully! Your messages will be sent at optimal times.')
              }} />
            )}

            {marketingActiveView === 'analytics' && (
              <AnalyticsDashboard />
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'gallery':
        return <GalleryTab 
          galleryItems={galleryItems}
          galleryLoading={galleryLoading}
          userTier={profile?.subscription_tier || 'free'}
          onRefresh={() => {
            // Refresh gallery data
            if (profile?.id) {
              setGalleryLoading(true)
              supabase
                .from('profile_gallery')
                .select('*')
                .eq('profile_id', profile.id)
                .order('created_at', { ascending: false })
                .then(({ data, error }) => {
                  if (!error) setGalleryItems(data || [])
                  setGalleryLoading(false)
                })
            }
          }}
        />
      case 'shop':
        return <BusinessShop businessId={profile?.id || ''} isOwner={true} />
      case 'marketing':
        return renderMarketingTab()
      default:
        return renderProfileTab()
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const tierBadge = getTierBadge()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-emerald-600">
                A2Z
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Welcome back,</span>
                <span className="font-medium text-gray-900">{displayName}</span>
                <Badge className={`${tierBadge.className} text-xs`}>
                  {tierBadge.text}
                </Badge>
              </div>
            </div>
            <UserProfileDropdown />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Profile Views</p>
                <p className="text-lg font-bold text-gray-900">1,234</p>
              </div>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Listings</p>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Conversion Clicks</p>
                <p className="text-lg font-bold text-gray-900">567</p>
              </div>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Store Rating</p>
                <p className="text-lg font-bold text-gray-900">4.8</p>
              </div>
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {dashboardTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-[9px] border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
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
