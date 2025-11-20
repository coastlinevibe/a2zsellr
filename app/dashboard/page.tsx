'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShareLinkBuilder from '@/components/ui/share-link-builder'
import CampaignScheduler from '@/components/ui/campaign-scheduler'
import AnalyticsDashboard from '@/components/ui/analytics-dashboard'
import TemplateEditor from '@/components/ui/template-editor'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
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
  Clipboard,
  Shield,
  Package
} from 'lucide-react'

import { useAuth } from '@/lib/auth'
import { PlanSelectionModal } from '@/components/PlanSelectionModal'
import { PaymentMethodModal } from '@/components/PaymentMethodModal'
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
import ResetCountdownBanner from '@/components/ResetCountdownBanner'
import TrialTimer from '@/components/TrialTimer'
import ResetNotificationModal from '@/components/ResetNotificationModal'
import { resetUserData } from '@/lib/trialManager'
import { PremiumBadge } from '@/components/ui/premium-badge'

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
  is_admin: boolean
  created_at?: string
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
  
  const [marketingActiveView, setMarketingActiveView] = useState('builder')
  const [marketingProducts, setMarketingProducts] = useState<any[]>([])
  const [editListing, setEditListing] = useState<any>(null)
  
  // Upgrade modal states
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'business'>('premium')
  
  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState({
    profileViews: 0,
    activeProducts: 0,
    activeListings: 0,
    storeRating: 0
  })
  const [metricsLoading, setMetricsLoading] = useState(true)
  

  // Redirect free and premium tier users away from business-only tabs
  useEffect(() => {
    if (profile?.subscription_tier !== 'business' && ['scheduler', 'analytics', 'templates'].includes(marketingActiveView)) {
      setMarketingActiveView('builder')
    }
  }, [profile?.subscription_tier, marketingActiveView])

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
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setMarketingProducts(data || [])
      } catch (error) {
        console.error('Error fetching marketing products:', error)
        setMarketingProducts([])
      }
    }

    if (profile?.id) {
      fetchMarketingProducts()
    }
  }, [profile?.id])

  // Also fetch products when marketing tab becomes active
  useEffect(() => {
    if (activeTab === 'marketing' && marketingActiveView === 'builder' && profile?.id && marketingProducts.length === 0) {
      // Trigger a re-fetch by updating the dependency
      const fetchProducts = async () => {
        try {
          const { data, error } = await supabase
            .from('profile_products')
            .select('*')
            .eq('profile_id', profile.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10)

          if (error) throw error
          setMarketingProducts(data || [])
        } catch (error) {
          console.error('Error fetching products on tab switch:', error)
        }
      }
      fetchProducts()
    }
  }, [activeTab, marketingActiveView, profile?.id])

  // Fetch dashboard metrics when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      fetchDashboardMetrics()
    }
  }, [profile?.id])

  const completePendingReferrals = async (userId: string) => {
    try {
      // Find any pending referrals where this user was referred
      const { data: pendingReferrals } = await supabase
        .from('referrals')
        .select('id, referrer_id')
        .eq('referred_user_id', userId)
        .eq('status', 'pending')

      if (pendingReferrals && pendingReferrals.length > 0) {
        // Mark referrals as completed and set earnings
        for (const referral of pendingReferrals) {
          await supabase
            .from('referrals')
            .update({
              status: 'completed',
              earnings_cents: 5000, // R50.00
              completed_at: new Date().toISOString()
            })
            .eq('id', referral.id)
        }
        
        console.log(`Completed ${pendingReferrals.length} referrals for user ${userId}`)
      }
    } catch (error) {
      console.error('Error completing pending referrals:', error)
    }
  }

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
        
        // Complete any pending referrals for this user
        completePendingReferrals(data.id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchDashboardMetrics = async () => {
    if (!profile?.id) return
    
    setMetricsLoading(true)
    try {
      // Fetch profile views from profile_analytics
      const { data: analyticsData } = await supabase
        .from('profile_analytics')
        .select('views, clicks')
        .eq('profile_id', profile.id)
      
      // Sum up all views and clicks
      const totalViews = analyticsData?.reduce((sum: number, record: any) => sum + record.views, 0) || 0
      const totalClicks = analyticsData?.reduce((sum: number, record: any) => sum + record.clicks, 0) || 0
      
      // Fetch active products
      const { data: activeProductsData } = await supabase
        .from('profile_products')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
      
      // Fetch listings (match marketing tab logic)
      const { data: listingsData } = await supabase
        .from('profile_listings')
        .select('id, status')
        .eq('profile_id', profile.id)
      
      // Fetch store rating
      const { data: reviewsData } = await supabase
        .from('profile_reviews')
        .select('rating')
        .eq('profile_id', profile.id)
      
      // Calculate average rating
      const avgRating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsData.length
        : 0
      
      setDashboardMetrics({
        profileViews: totalViews,
        activeProducts: activeProductsData?.length || 0,
        activeListings: (listingsData || []).filter((listing: any) => (listing?.status || '').toLowerCase() === 'active').length,
        storeRating: Number(avgRating.toFixed(1))
      })
      
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
    } finally {
      setMetricsLoading(false)
    }
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

  // Upgrade modal handlers
  const handlePlanSelection = (plan: 'premium' | 'business') => {
    setSelectedPlan(plan)
    setShowPlanModal(false)
    setShowPaymentModal(true)
  }

  const handleBackToPlanSelection = () => {
    setShowPaymentModal(false)
    setShowPlanModal(true)
  }

  const handleCloseModals = () => {
    setShowPlanModal(false)
    setShowPaymentModal(false)
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Reset Countdown Banner for Free Tier */}
      {profile && profile.subscription_tier === 'free' && (
        <ResetCountdownBanner
          profileCreatedAt={profile.created_at || new Date().toISOString()}
          subscriptionTier={profile.subscription_tier}
          onUpgradeClick={() => router.push('/dashboard')}
        />
      )}
      
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Public Profile Preview</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Convert display name to URL-friendly slug
                  const profileSlug = profile.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'profile'
                  const profileUrl = `https://www.a2zsellr.life/profile/${profileSlug}`
                  navigator.clipboard.writeText(profileUrl)
                  alert('Profile link copied to clipboard!')
                }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Profile Link
              </Button>
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
    const userTier = profile?.subscription_tier || 'free'
    const isBusinessFeature = (viewId: string) => ['scheduler', 'analytics', 'templates'].includes(viewId)
    
    const marketingViews = [
      { id: 'builder', label: 'Listing Builder', icon: Plus },
      { id: 'campaigns', label: 'My Listings', icon: MessageSquare },
      { id: 'templates', label: 'My Templates', icon: Clipboard, business: true },
      { id: 'scheduler', label: 'Scheduler', icon: Calendar, business: true },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, business: true }
    ]

    return (
      <div className="space-y-8" id="whatsapp-builder">
        {profile?.subscription_tier === 'free' && (
          <FreeAccountNotifications onUpgrade={() => setShowPlanModal(true)} />
        )}

        {/* Marketing Tools */}
        <div className="bg-white rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="border-b-2 border-black">
            <div className="flex gap-1 p-2">
              {marketingViews.map((view) => {
                const IconComponent = view.icon
                const isDisabled = userTier !== 'business' && isBusinessFeature(view.id)
                const isActive = marketingActiveView === view.id && !isDisabled
                
                return (
                  <div key={view.id} className="flex-1 relative">
                    <button
                      onClick={() => {
                        if (isDisabled) {
                          const upgradeMessage = userTier === 'free' 
                            ? '🔒 This feature is only available on Business tier.\n\nUpgrade to Business to unlock advanced marketing tools!'
                            : '🔒 This feature is only available on Business tier.\n\nUpgrade from Premium to Business to unlock advanced marketing tools!'
                          alert(upgradeMessage)
                          return
                        }
                        setMarketingActiveView(view.id)
                      }}
                      className={`w-full py-3 px-4 rounded-[6px] border-2 border-black font-bold transition-all flex items-center justify-center gap-2 ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]'
                          : isDisabled
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]'
                          : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-gray-100'
                      }`}
                      disabled={isDisabled}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{view.label}</span>
                    </button>
                    {isDisabled && (
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white text-xs px-2 py-1 rounded-lg border border-black font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200" style={{ zIndex: 10 }}>
                        <Crown className="w-3 h-3" />
                        {userTier === 'free' ? 'UPGRADE' : 'BUSINESS'}
                        <Star className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {marketingActiveView === 'builder' && (
              <ShareLinkBuilder 
                products={marketingProducts} 
                businessProfile={profile} 
                editListing={editListing}
                onRefresh={fetchDashboardMetrics}
              />
            )}

            {marketingActiveView === 'campaigns' && (
              <MarketingCampaignsTab 
                onCreateNew={() => {
                  // Clear any existing edit data for new listing
                  setEditListing(null)
                  setMarketingActiveView('builder')
                }} 
                onEditListing={(listing) => {
                  // Switch to builder and load listing for editing
                  setEditListing(listing)
                  setMarketingActiveView('builder')
                  console.log('Editing listing:', listing)
                }}
                userTier={profile?.subscription_tier || 'free'} 
                businessProfile={profile || undefined}
                onRefresh={fetchDashboardMetrics}
              />
            )}

            {marketingActiveView === 'templates' && (
              userTier !== 'business' ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Clipboard className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">My Templates</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {userTier === 'free' 
                      ? 'Access professional templates to create stunning marketing pages. Only available on Business tier.'
                      : 'Advanced template management is only available on Business tier. Upgrade to unlock professional templates and customization options.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO BUSINESS' : 'UPGRADE TO BUSINESS'}</span>
                    <Star className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">My Templates</h3>
                    <button 
                      onClick={() => setMarketingActiveView('builder')}
                      className="bg-blue-500 text-white px-6 py-3 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Create New Template
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Health Insurance Template */}
                    <div className="bg-blue-100 border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-600 p-2 rounded-full border-2 border-black mr-3">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-black">Health Insurance</h4>
                          <p className="text-sm font-bold text-black">Professional service template</p>
                        </div>
                      </div>
                      <p className="text-black text-sm mb-4 font-medium">
                        Complete health insurance landing page with plan comparisons, testimonials, and trust indicators.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open('/template-preview/health-insurance', '_blank')}
                          className="flex-1 bg-white text-black px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-sm hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] transition-all"
                        >
                          <Eye className="w-4 h-4 mr-1 inline" />
                          Preview
                        </button>
                        <button 
                          onClick={() => {
                            setMarketingActiveView('template_editor')
                          }}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-sm hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600 transition-all"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>

                    {/* Coming Soon Templates */}
                    <div className="bg-gray-100 border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-600 p-2 rounded-full border-2 border-black mr-3">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-black">Product Showcase</h4>
                          <p className="text-sm font-bold text-black">Coming soon</p>
                        </div>
                      </div>
                      <p className="text-black text-sm mb-4 font-medium">
                        Perfect for retail businesses showcasing multiple products with pricing and features.
                      </p>
                      <button disabled className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] font-bold text-sm cursor-not-allowed">
                        Coming Soon
                      </button>
                    </div>

                    <div className="bg-gray-100 border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-600 p-2 rounded-full border-2 border-black mr-3">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-black">Service Business</h4>
                          <p className="text-sm font-bold text-black">Coming soon</p>
                        </div>
                      </div>
                      <p className="text-black text-sm mb-4 font-medium">
                        Ideal for salons, consultants, and service providers with booking capabilities.
                      </p>
                      <button disabled className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] font-bold text-sm cursor-not-allowed">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {marketingActiveView === 'template_editor' && (
              <TemplateEditor 
                templateId="health-insurance"
                onSave={(data) => {
                  console.log('Template saved:', data)
                }}
                onShare={(url) => {
                  console.log('Template shared:', url)
                  alert(`🎉 Template is now live! Share this URL: ${url}`)
                }}
              />
            )}

            {marketingActiveView === 'scheduler' && (
              userTier !== 'business' ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-12 h-12 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {userTier === 'free' 
                      ? 'Schedule your marketing campaigns for optimal engagement times. Only available on Business tier.'
                      : 'Advanced campaign scheduling is only available on Business tier. Upgrade to unlock automated scheduling and optimal timing features.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO BUSINESS' : 'UPGRADE TO BUSINESS'}</span>
                    <Star className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <CampaignScheduler onSchedule={(settings) => {
                  console.log('Campaign scheduled:', settings)
                  alert('🎉 Campaign scheduled successfully! Your messages will be sent at optimal times.')
                }} />
              )
            )}

            {marketingActiveView === 'analytics' && (
              userTier !== 'business' ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <TrendingUp className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {userTier === 'free' 
                      ? 'Track your campaign performance with detailed analytics and insights. Only available on Business tier.'
                      : 'Advanced analytics and detailed insights are only available on Business tier. Upgrade to unlock comprehensive performance tracking and ROI analysis.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO BUSINESS' : 'UPGRADE TO BUSINESS'}</span>
                    <Star className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <AnalyticsDashboard />
              )
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
          onUpgrade={() => setShowPlanModal(true)}
        />
      case 'shop':
        return <BusinessShop 
          businessId={profile?.id || ''} 
          isOwner={true} 
          userTier={profile?.subscription_tier || 'free'}
          onRefresh={fetchDashboardMetrics}
        />
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
      {/* Reset Notification Modal */}
      {profile && (
        <ResetNotificationModal
          profileCreatedAt={profile.created_at || new Date().toISOString()}
          lastResetAt={null}
          subscriptionTier={profile.subscription_tier}
          onUpgrade={() => setShowPlanModal(true)}
        />
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={handleCloseModals}
        onSelectPlan={handlePlanSelection}
        currentTier={profile?.subscription_tier as 'free' | 'premium' | 'business'}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={handleCloseModals}
        onBack={handleBackToPlanSelection}
        selectedPlan={selectedPlan}
        userProfile={profile}
      />

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
                {/* Premium Badge */}
                {profile && profile.subscription_tier !== 'free' && (
                  <PremiumBadge 
                    tier={profile.subscription_tier}
                    size="sm"
                  />
                )}
                {/* Free Tier Badge */}
                {profile && profile.subscription_tier === 'free' && (
                  <Badge className="bg-gray-100 text-gray-700 text-xs">
                    Free
                  </Badge>
                )}
                {/* Trial Timer in Header */}
                {profile && profile.subscription_tier === 'free' && user && (
                  <TrialTimer
                    userId={user.id}
                    compact={true}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Admin Dashboard Button - Only show for admin users */}
              {profile && (profile.is_admin || profile.email === 'admin@out.com') && (
                <Button 
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  GoTo Admin Dash
                </Button>
              )}
              <UserProfileDropdown
                displayName={profile?.display_name}
                avatarUrl={profile?.avatar_url || undefined}
                subscriptionTier={profile?.subscription_tier}
                userProfile={profile}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Profile Views</p>
                <p className="text-2xl font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.profileViews.toLocaleString()
                  )}
                </p>
              </div>
              <div className="bg-blue-600 rounded-full p-2 border-2 border-black">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-emerald-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Active Products</p>
                <p className="text-2xl font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.activeProducts
                  )}
                </p>
              </div>
              <div className="bg-emerald-600 rounded-full p-2 border-2 border-black">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-purple-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Active Listings</p>
                <p className="text-2xl font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.activeListings
                  )}
                </p>
              </div>
              <div className="bg-purple-600 rounded-full p-2 border-2 border-black">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-yellow-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Store Rating</p>
                <p className="text-2xl font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.storeRating === 0 ? '0.0' : dashboardMetrics.storeRating
                  )}
                </p>
              </div>
              <div className="bg-yellow-600 rounded-full p-2 border-2 border-black">
                <Star className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {dashboardTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[9px] border-2 border-black font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]'
                    : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-5 h-5" />
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
