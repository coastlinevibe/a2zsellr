'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ShareLinkBuilder from '@/components/ui/share-link-builder'
import CampaignScheduler from '@/components/ui/campaign-scheduler'
import AnalyticsDashboard from '@/components/ui/analytics-dashboard'
import TemplateEditor from '@/components/ui/template-editor'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Sword,
  Zap,
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
  Package,
  Plug,
  Loader2
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
import { ProfileSettingsTab } from '@/components/ProfileSettingsTab'
import { GalleryTab } from '@/components/dashboard/GalleryTab'
import { ProfileCardTab } from '@/components/dashboard/ProfileCardTab'
import { MarketingCampaignsTab } from '@/components/dashboard/MarketingCampaignsTab'
import PublicProfilePreview from '@/components/ui/public-profile-preview'
import { DashboardTour } from '@/components/DashboardTour'
import ResetCountdownBanner from '@/components/ResetCountdownBanner'
import TrialTimer from '@/components/TrialTimer'
import { resetUserData } from '@/lib/trialManager'
import { PremiumBadge } from '@/components/ui/premium-badge'
import WhatsAppIntegration from '@/components/integrations/WhatsAppIntegration'
import { AnimatedCounter } from '@/components/ui/animated-counter'

type SubscriptionTier = 'free' | 'premium' | 'business'
type DashboardTab = 'profile' | 'products' | 'branding' | 'card' | 'listings' | 'integrations'

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
  address: string | null
  business_hours: any
  business_card_image: string | null
  is_admin: boolean
  onboarding_completed?: boolean
  created_at?: string
}

const dashboardTabs: { key: DashboardTab; label: string; subtitle: string; icon: typeof Users; premiumOnly?: boolean }[] = [
  { key: 'profile', label: 'Profile', subtitle: 'View your profile', icon: Users },
  { key: 'products', label: 'Products', subtitle: 'Manage your inventory', icon: ShoppingBag },
  { key: 'branding', label: 'Profile Image', subtitle: 'Your professional image', icon: ImageIcon },
  { key: 'card', label: 'Profile Card', subtitle: 'Your business card', icon: ImageIcon },
  { key: 'listings', label: 'Listings', subtitle: 'Create & amplify your reach', icon: MessageSquare },
  { key: 'integrations', label: 'Social Integrations', subtitle: 'Connect social & messaging apps', icon: Plug, premiumOnly: true }
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('products')
  const [carouselIndex, setCarouselIndex] = useState(0)
  
  // Welcome animation state
  const [showWelcome, setShowWelcome] = useState(true)
  const [welcomePhase, setWelcomePhase] = useState<'text' | 'transition' | 'done'>('text')
  
  // Tour state
  const [showTour, setShowTour] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourComplete, setTourComplete] = useState(false)
  const [showCompletionToast, setShowCompletionToast] = useState(false)
  const [showMobileOnboarding, setShowMobileOnboarding] = useState(true)
  
  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  
  const [marketingActiveView, setMarketingActiveView] = useState('builder')
  const [marketingProducts, setMarketingProducts] = useState<any[]>([])
  const [editListing, setEditListing] = useState<any>(null)
  
  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  
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
  
  // Admin impersonation state
  const [impersonationData, setImpersonationData] = useState<{
    isImpersonating: boolean
    impersonatedUserId: string | null
    impersonatedUserName: string | null
  }>({
    isImpersonating: false,
    impersonatedUserId: null,
    impersonatedUserName: null
  })

  // Welcome messages
  const welcomeMessages = [
    "Welcome to your dashboard",
    "Let's grow your profile",
    "Time to shine online",
    "Your success starts here",
    "Ready to boost sales?",
    "Welcome aboard, entrepreneur",
    "Let's make magic happen",
    "Your empire awaits",
    "Time to dominate",
    "Welcome to the future"
  ]

  const randomWelcomeMessage = useMemo(() => {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
  }, [])

  // Tour steps definition
  const tourSteps = [
    {
      target: 'tour-stats',
      title: '📊 Dashboard Stats',
      description: 'View your profile views, products, listings, and rating.',
      action: 'Next'
    },
    {
      target: 'tour-profile-tab',
      title: '👤 Profile Tab',
      description: 'View and update your profile info and settings.',
      action: 'Next',
      preAction: () => setActiveTab('profile')
    },
    {
      target: 'tour-products-tab',
      title: '📦 Products Tab',
      description: 'Add and manage your products.',
      action: 'Next',
      preAction: () => setActiveTab('products')
    },
    {
      target: 'tour-branding-tab',
      title: '🖼️ Profile Image Tab',
      description: 'Upload your profile image.',
      action: 'Next',
      preAction: () => setActiveTab('branding')
    },
    {
      target: 'tour-listings-tab',
      title: '📣 Listings Tab',
      description: 'Create campaigns and share on WhatsApp and social media.',
      action: 'Next',
      preAction: () => setActiveTab('listings')
    },
    {
      target: 'tour-edit-profile-btn',
      title: '✏️ Edit Profile',
      description: 'Click here to update your business information and settings.',
      action: 'Finish Tour'
    }
  ]

  // Welcome animation effect
  useEffect(() => {
    if (!showWelcome) return

    // Text phase: 3 seconds (increased from 2 for readability)
    const textTimer = setTimeout(() => {
      setWelcomePhase('transition')
    }, 3000)

    // Transition phase: 1 second (decreased from 1.5)
    const transitionTimer = setTimeout(() => {
      setWelcomePhase('done')
      setShowWelcome(false)
    }, 4000)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(transitionTimer)
    }
  }, [showWelcome])

  // Start tour after welcome animation if onboarding not completed
  useEffect(() => {
    if (showWelcome || welcomePhase !== 'done' || profile?.onboarding_completed) return
    
    // Only start tour on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setShowTour(true)
    }
  }, [welcomePhase, profile?.onboarding_completed, showWelcome])

  // Execute preAction when tour step changes
  useEffect(() => {
    if (!showTour || tourStep >= tourSteps.length) return
    
    const currentStep = tourSteps[tourStep]
    if (currentStep.preAction) {
      currentStep.preAction()
    }
  }, [tourStep, showTour, tourSteps])

  // Disable scrolling when tour is active
  useEffect(() => {
    if (showTour) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showTour])

  // Set tourComplete when tour reaches the end
  useEffect(() => {
    if (tourStep >= tourSteps.length) {
      setTourComplete(true)
    }
  }, [tourStep, tourSteps.length])

  // Check for admin impersonation cookies
  useEffect(() => {
    const checkImpersonation = () => {
      if (typeof document === 'undefined') return
      
      const impersonatedUserId = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_impersonating='))
        ?.split('=')[1]
      
      const impersonatedUserName = document.cookie
        .split('; ')
        .find(row => row.startsWith('impersonated_user_name='))
        ?.split('=')[1]
      
      setImpersonationData({
        isImpersonating: !!impersonatedUserId,
        impersonatedUserId: impersonatedUserId || null,
        impersonatedUserName: impersonatedUserName ? decodeURIComponent(impersonatedUserName) : null
      })
    }
    
    checkImpersonation()
    
    // Also check cookies when the page becomes visible (in case cookies were set in another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkImpersonation()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Redirect free and premium tier users away from premium-only tabs
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
  }, [user, loading, router, impersonationData])

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
        setMarketingProducts([])
      }
    }

    if (profile?.id) {
      fetchMarketingProducts()
    }
  }, [profile?.id])

  // Also fetch products when listings tab becomes active
  useEffect(() => {
    if (activeTab === 'listings' && marketingActiveView === 'builder' && profile?.id && marketingProducts.length === 0) {
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
          // Error fetching products
        }
      }
      fetchProducts()
    }
  }, [activeTab, marketingActiveView, profile?.id])

  // Handle product creation modal from URL
  useEffect(() => {
    if (searchParams.get('modal') === 'product-creation') {
      setActiveTab('products')
    }
  }, [searchParams])

  // Fetch dashboard metrics when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      fetchDashboardMetrics()
    }
  }, [profile?.id])

  // Fetch saved templates when templates tab becomes active
  useEffect(() => {
    if (activeTab === 'listings' && marketingActiveView === 'templates' && profile?.id) {
      fetchSavedTemplates()
    }
  }, [activeTab, marketingActiveView, profile?.id])

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

      const targetUserId = impersonationData.impersonatedUserId || user.id



      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        // Error fetching profile
      } else {
        setProfile(data as UserProfile)
        
        // Complete any pending referrals for this user (only if not impersonating)
        if (!impersonationData.isImpersonating) {
          completePendingReferrals(data.id)
        }
      }
    } catch (error) {
      // Error fetching profile
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchDashboardMetrics = async () => {
    if (!profile?.id) return
    
    setMetricsLoading(true)
    try {
      // Use the profile ID (which could be impersonated user's ID)
      const targetProfileId = profile.id
      
      // Fetch profile views from profile_analytics
      const { data: analyticsData } = await supabase
        .from('profile_analytics')
        .select('views, clicks')
        .eq('profile_id', targetProfileId)
      
      // Sum up all views and clicks
      const totalViews = analyticsData?.reduce((sum: number, record: any) => sum + record.views, 0) || 0
      const totalClicks = analyticsData?.reduce((sum: number, record: any) => sum + record.clicks, 0) || 0
      
      // Fetch active products
      const { data: activeProductsData } = await supabase
        .from('profile_products')
        .select('id')
        .eq('profile_id', targetProfileId)
        .eq('is_active', true)
      
      // Fetch listings (match marketing tab logic)
      const { data: listingsData } = await supabase
        .from('profile_listings')
        .select('id, status')
        .eq('profile_id', targetProfileId)
      
      // Fetch store rating
      const { data: reviewsData } = await supabase
        .from('profile_reviews')
        .select('rating')
        .eq('profile_id', targetProfileId)
      
      // Calculate average rating (default to 0 if no reviews)
      const avgRating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsData.length
        : 0 // No rating for new profiles
      
      setDashboardMetrics({
        profileViews: totalViews,
        activeProducts: activeProductsData?.length || 0,
        activeListings: (listingsData || []).filter((listing: any) => (listing?.status || '').toLowerCase() === 'active').length,
        storeRating: Number(avgRating.toFixed(1))
      })
      
    } catch (error) {
      // Error fetching metrics
    } finally {
      setMetricsLoading(false)
    }
  }

  const fetchSavedTemplates = async () => {
    if (!profile?.id) return
    
    setTemplatesLoading(true)
    try {
      const { data, error } = await supabase
        .from('profile_listings')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_template', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedTemplates(data || [])
    } catch (error) {
      // Error fetching templates
    } finally {
      setTemplatesLoading(false)
    }
  }

  const getTierBadge = () => {
    if (!profile) return { text: 'Free', className: 'bg-gray-100 text-gray-700' }

    const badges = {
      free: { text: 'Free', className: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border border-gray-300 shadow-lg font-bold' },
      premium: { text: 'Premium', className: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white border border-amber-300 shadow-lg font-bold' },
      business: { text: 'Premium', className: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border border-blue-400 shadow-lg font-bold' }
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

  const renderProfileTab = () => {
    if (!profile) return null
    
    return (
      <ProfileSettingsTab profile={profile} />
    )
  }

  const renderIntegrationsTab = () => (
      <div className="space-y-8">
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Social Integrations</h2>
          <p className="text-gray-600 mt-1">Connect WhatsApp to power your marketing and support.</p>
          </div>
          
          <div className="p-6">
          <WhatsAppIntegration />
          </div>
        </div>
      </div>
    )

  const renderMarketingTab = () => {
    const userTier = profile?.subscription_tier || 'free'
    const isPremiumFeature = (viewId: string) => ['scheduler', 'analytics', 'templates'].includes(viewId)
    
    const marketingViews = [
      { id: 'builder', label: 'Listing Builder', icon: Plus },
      { id: 'campaigns', label: 'My Listings', icon: MessageSquare },
      { id: 'templates', label: 'My Templates', icon: Clipboard, premium: true },
      { id: 'scheduler', label: 'Scheduler', icon: Calendar, premium: true },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, premium: true }
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
                const isDisabled = userTier !== 'business' && isPremiumFeature(view.id)
                const isActive = marketingActiveView === view.id && !isDisabled
                
                return (
                  <div key={view.id} className="flex-1 relative">
                    <button
                      onClick={() => {
                        if (isDisabled) {
                          const upgradeMessage = userTier === 'free' 
                            ? '🔒 This feature is only available on Premium tier.\n\nUpgrade to Premium to unlock advanced marketing tools!'
                            : '🔒 This feature is only available on Premium tier.\n\nUpgrade to Premium to unlock advanced marketing tools!'
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
                        {userTier === 'free' ? 'UPGRADE' : 'PREMIUM'}
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
                onGoToListings={() => setMarketingActiveView('campaigns')}
                onUpgrade={() => setShowPlanModal(true)}
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
                }}
                onDelete={() => {
                  // Clear edit state when a listing is deleted
                  setEditListing(null)
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
                      ? 'Access professional templates to create stunning marketing pages. Only available on Premium tier and above.'
                      : 'Advanced template management is only available on Premium tier and above. Upgrade to unlock professional templates and customization options.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO PREMIUM' : 'UPGRADE TO PREMIUM'}</span>
                    <Star className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">My Templates</h3>
                    <p className="text-sm text-gray-600 mt-1">Templates you create in the Listing Builder will appear here</p>
                  </div>
                  
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : savedTemplates.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-[9px] border-2 border-dashed border-gray-300">
                      <Clipboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h4>
                      <p className="text-gray-600 mb-6">Create a custom template in the Listing Builder and save it to see it here</p>
                      <button
                        onClick={() => setMarketingActiveView('builder')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Go to Listing Builder
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedTemplates.map((template) => (
                        <div key={template.id} className="bg-white border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-all">
                          <div className="mb-4">
                            <h4 className="font-black text-black text-lg">{template.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.layout_type === 'custom-template' ? '🎨 Custom Template' : `Layout: ${template.layout_type}`}
                            </p>
                          </div>
                          <p className="text-black text-sm mb-4 font-medium line-clamp-2">
                            {template.message_template || 'No description'}
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditListing(template)
                                setMarketingActiveView('builder')
                              }}
                              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-[6px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold text-sm hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600 transition-all"
                            >
                              <Edit className="w-4 h-4 mr-1 inline" />
                              Use Template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {marketingActiveView === 'template_editor' && (
              <TemplateEditor 
                templateId="health-insurance"
                onSave={(data) => {
                  // Template saved
                }}
                onShare={(url) => {
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
                      ? 'Schedule your marketing campaigns for optimal engagement times. Only available on Premium tier.'
                      : 'Advanced campaign scheduling is only available on Premium tier. Upgrade to unlock automated scheduling and optimal timing features.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO PREMIUM' : 'UPGRADE TO PREMIUM'}</span>
                    <Star className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <CampaignScheduler onSchedule={(settings) => {
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
                      ? 'Track your campaign performance with detailed analytics and insights. Only available on Premium tier.'
                      : 'Advanced analytics and detailed insights are only available on Premium tier. Upgrade to unlock comprehensive performance tracking and ROI analysis.'
                    }
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black py-2 px-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{userTier === 'free' ? 'UPGRADE TO PREMIUM' : 'UPGRADE TO PREMIUM'}</span>
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
      case 'products':
        return <BusinessShop 
          businessId={profile?.id || ''} 
          isOwner={true} 
          userTier={profile?.subscription_tier || 'free'}
          onRefresh={fetchDashboardMetrics}
        />
      case 'branding':
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
      case 'card':
        return <ProfileCardTab 
          profile={profile}
          onRefresh={fetchDashboardMetrics}
        />
      case 'listings':
        return renderMarketingTab()
      case 'integrations':
        return renderIntegrationsTab()
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
      {/* Welcome Animation Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome-overlay"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ backgroundColor: 'rgba(248, 250, 252, 1)' }}
            animate={{
              backgroundColor: welcomePhase === 'transition' 
                ? 'rgba(248, 250, 252, 1)' 
                : 'rgba(248, 250, 252, 1)'
            }}
            exit={{ backgroundColor: 'rgba(248, 250, 252, 0)' }}
            transition={{ duration: 0.8 }}
          >
            {/* Background animation grid */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: welcomePhase === 'transition' ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-blue-400/5 to-slate-400/5" />
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]" />
              </motion.div>
            </motion.div>

            {/* Welcome text content */}
            <motion.div
              className="relative z-10 text-center px-4"
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: welcomePhase === 'text' ? 1 : 0,
                scale: welcomePhase === 'text' ? 1 : 0.95
              }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-black text-slate-800 mb-4"
                initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut', type: 'spring', stiffness: 50, damping: 15 }}
              >
                Hello, {profile?.display_name?.split(' ')[0] || 'there'}! 👋
              </motion.h1>
              
              <motion.p
                className="text-2xl md:text-3xl font-semibold text-slate-600 mb-8"
                initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut', type: 'spring', stiffness: 50, damping: 15 }}
              >
                {randomWelcomeMessage}
              </motion.p>

              <motion.div
                className="flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Transition animation */}
            {welcomePhase === 'transition' && (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-emerald-400/20 via-blue-400/10 to-slate-400/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 1 }}
                />
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1.1] }}
                  transition={{ duration: 1 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Tour */}
      <DashboardTour
        isOpen={showTour}
        currentStep={tourStep}
        steps={tourSteps}
        onNext={() => {
          if (tourStep + 1 >= tourSteps.length) {
            setShowTour(false)
            setShowCompletionToast(true)
            setTimeout(() => setShowCompletionToast(false), 4000)
          } else {
            setTourStep(tourStep + 1)
          }
        }}
        onPrev={() => setTourStep(Math.max(0, tourStep - 1))}
        onClose={() => {
          setShowTour(false)
          setTourStep(0)
        }}
      />

      {/* Completion Toast */}
      {showCompletionToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-50 bg-emerald-500 text-white px-8 py-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-black text-lg"
        >
          🎉 Tour Complete! You're all set!
        </motion.div>
      )}

      {/* Mark tour as complete in Supabase when desktop tour finishes */}
      {showCompletionToast && (
        <MarkTourComplete userId={user?.id} />
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
          {/* Admin Impersonation Banner */}
          {impersonationData.isImpersonating && (
            <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold">
              🔑 ADMIN IMPERSONATION MODE: Viewing as "{impersonationData.impersonatedUserName || 'Unknown User'}"
              <button
                onClick={async () => {
                  // Clear impersonation cookies
                  document.cookie = 'admin_impersonating=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                  document.cookie = 'impersonated_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                  // Redirect back to admin dashboard
                  window.location.href = '/admin'
                }}
                className="ml-4 bg-white text-red-600 px-3 py-1 rounded font-bold hover:bg-gray-100"
              >
                Exit Impersonation
              </button>
            </div>
          )}
          
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
                  <Badge className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border border-gray-300 shadow-lg font-bold text-xs">
                    <Zap className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />
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
              {/* Restart Tour Button */}
              <Button 
                onClick={() => {
                  setTourStep(0)
                  setShowTour(true)
                }}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hidden md:flex"
                title="Restart the guided tour"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Tour
              </Button>
              {/* Admin Dashboard Button - Only show for admin users or when impersonating */}
              {((profile && (profile.is_admin || profile.email === 'admin@out.com')) || impersonationData.isImpersonating) && (
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

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ duration: 0.6, delay: showWelcome ? 0 : 0.2 }}
      >
        {/* Stats - Desktop */}
        <div id="tour-stats" className={`hidden md:grid ${profile?.subscription_tier === 'free' ? 'grid-cols-3' : 'grid-cols-4'} gap-4 mb-6`}>
          <motion.div 
            className="bg-blue-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4"
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut', type: 'spring', stiffness: 60, damping: 15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Profile Views</p>
                <p className="text-2xl font-black text-black">
                  <AnimatedCounter value={dashboardMetrics.profileViews} duration={2} delay={0.2} isLoading={metricsLoading} />
                </p>
              </div>
              <motion.div 
                className="bg-blue-600 rounded-full p-2 border-2 border-black"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, delay: 0.3 }}
              >
                <Eye className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-emerald-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4"
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut', type: 'spring', stiffness: 60, damping: 15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Active Products</p>
                <p className="text-2xl font-black text-black">
                  <AnimatedCounter value={dashboardMetrics.activeProducts} duration={2} delay={0.3} isLoading={metricsLoading} />
                </p>
              </div>
              <motion.div 
                className="bg-emerald-600 rounded-full p-2 border-2 border-black"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-purple-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4"
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut', type: 'spring', stiffness: 60, damping: 15 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black">Active Listings</p>
                <p className="text-2xl font-black text-black">
                  <AnimatedCounter value={dashboardMetrics.activeListings} duration={2} delay={0.4} isLoading={metricsLoading} />
                </p>
              </div>
              <motion.div 
                className="bg-purple-600 rounded-full p-2 border-2 border-black"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
              >
                <TrendingUp className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {profile?.subscription_tier !== 'free' && (
            <motion.div 
              className="bg-yellow-100 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] p-4"
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: 'easeOut', type: 'spring', stiffness: 60, damping: 15 }}
            >
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
                <motion.div 
                  className="bg-yellow-600 rounded-full p-2 border-2 border-black"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                >
                  <Star className="h-5 w-5 text-white" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats - Mobile (Compact) */}
        <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-100 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-black">Views</p>
                <p className="text-lg font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.profileViews.toLocaleString()
                  )}
                </p>
              </div>
              <div className="bg-blue-600 rounded-full p-1.5 border-2 border-black flex-shrink-0">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-emerald-100 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-black">Products</p>
                <p className="text-lg font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.activeProducts
                  )}
                </p>
              </div>
              <div className="bg-emerald-600 rounded-full p-1.5 border-2 border-black flex-shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-purple-100 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-black">Listings</p>
                <p className="text-lg font-black text-black">
                  {metricsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardMetrics.activeListings
                  )}
                </p>
              </div>
              <div className="bg-purple-600 rounded-full p-1.5 border-2 border-black flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          {profile?.subscription_tier !== 'free' && (
            <div className="bg-yellow-100 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-black">Rating</p>
                  <p className="text-lg font-black text-black">
                    {metricsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      dashboardMetrics.storeRating === 0 ? '0.0' : dashboardMetrics.storeRating
                    )}
                  </p>
                </div>
                <div className="bg-yellow-600 rounded-full p-1.5 border-2 border-black flex-shrink-0">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Mobile Onboarding Card */}
        {showMobileOnboarding && !profile?.onboarding_completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mb-6 bg-white rounded-lg border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-black text-black mb-1">👋 Welcome to Your Dashboard!</h3>
                <p className="text-xs text-gray-700 font-bold mb-3">
                  Start by adding a product, then create a listing to share with customers.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <span className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black text-white">1</span>
                    Add your first product
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <span className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black text-white">2</span>
                    Upload profile image
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-black">
                    <span className="bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black text-white">3</span>
                    Share & grow!
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileOnboarding(false)}
                className="flex-shrink-0 text-black hover:bg-black/10 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Tabs - Desktop View */}
        <div id="tour-tabs" className="hidden md:flex flex-wrap gap-4 mb-8 items-start">
          <div className="flex flex-wrap gap-4">
            {dashboardTabs.map((tab) => {
              // Hide premium-only tabs for free tier users
              if (tab.premiumOnly && profile?.subscription_tier === 'free') {
                return null
              }

              // Hide integrations tab for non-admin users
              if (tab.key === 'integrations' && !profile?.is_admin) {
                return null
              }

              const IconComponent = tab.icon
              const isActive = activeTab === tab.key
              const tourId = `tour-${tab.key}-tab`

              return (
                <button
                  key={tab.key}
                  id={tourId}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-start gap-1 px-6 py-3 rounded-[9px] border-2 border-black font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]'
                      : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    {tab.label}
                  </div>
                  <span className={`text-xs font-normal ${isActive ? 'text-emerald-100' : 'text-gray-600'}`}>
                    {tab.subtitle}
                  </span>
                </button>
              )
            })}
          </div>
          <Link
            id="tour-edit-profile-btn"
            href="/profile"
            className="flex flex-col items-start gap-1 px-6 py-3 rounded-[9px] border-2 border-black font-bold transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit profile
            </div>
            <span className="text-xs font-normal text-gray-600">
              Update your information
            </span>
          </Link>
        </div>

        {/* Tabs - Mobile Carousel View */}
        <div className="md:hidden mb-6">
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(calc(-${carouselIndex * 100}% + ${carouselIndex > 0 ? '4px' : '0px'}))`
                }}
              >
                {dashboardTabs.map((tab) => {
                  // Hide premium-only tabs for free tier users
                  if (tab.premiumOnly && profile?.subscription_tier === 'free') {
                    return null
                  }

                  // Hide integrations tab for non-admin users
                  if (tab.key === 'integrations' && !profile?.is_admin) {
                    return null
                  }

                  const IconComponent = tab.icon
                  const isActive = activeTab === tab.key

                  return (
                    <div
                      key={tab.key}
                      className="w-full flex-shrink-0 px-1"
                    >
                      <button
                        onClick={() => {
                          setActiveTab(tab.key)
                          const visibleTabs = dashboardTabs.filter(t => (!t.premiumOnly || profile?.subscription_tier !== 'free') && (t.key !== 'integrations' || profile?.is_admin))
                          setCarouselIndex(visibleTabs.findIndex(t => t.key === tab.key))
                        }}
                        className={`w-full flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-black font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]'
                            : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]'
                        }`}
                      >
                        <div className={`rounded-full p-2 border-2 border-black ${
                          isActive 
                            ? 'bg-white' 
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-white'}`} />
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-black leading-tight">{tab.label}</h3>
                          <p className={`text-xs font-normal mt-0.5 ${isActive ? 'text-emerald-100' : 'text-gray-600'}`}>
                            {tab.subtitle}
                          </p>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {dashboardTabs.map((tab, index) => {
                // Hide dots for premium-only tabs for free tier users
                if (tab.premiumOnly && profile?.subscription_tier === 'free') {
                  return null
                }

                // Hide dots for integrations tab for non-admin users
                if (tab.key === 'integrations' && !profile?.is_admin) {
                  return null
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      const visibleTabs = dashboardTabs.filter(t => (!t.premiumOnly || profile?.subscription_tier !== 'free') && (t.key !== 'integrations' || profile?.is_admin))
                      const visibleIndex = visibleTabs.findIndex(t => t.key === tab.key)
                      setCarouselIndex(visibleIndex)
                      setActiveTab(tab.key)
                    }}
                    className={`rounded-full transition-all ${
                      carouselIndex === index
                        ? 'bg-emerald-500 w-5 h-2'
                        : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                    }`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div>{renderActiveTab()}</div>

        {/* Public Profile Preview - Below all tabs (only on Profile tab) */}
        {profile && activeTab === 'profile' && (
          <div className="mt-12 bg-white rounded-[9px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-900">How Your Profile Looks to Customers</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Convert display name to URL-friendly slug using encodeURIComponent
                    const profileSlug = encodeURIComponent(profile.display_name?.toLowerCase().trim() || 'profile')
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
              <p className="text-sm text-gray-600 mt-1">This is exactly how customers see your profile when they click on your listing card or search results</p>
            </div>
            <div className="p-6">
              <PublicProfilePreview profile={profile} />
            </div>
          </div>
        )}

        {/* Tour End Marker */}
        <div id="tour-end" className="mt-8" />
      </motion.div>
    </div>
  )
}

// Helper component to mark tour as complete in Supabase
function MarkTourComplete({ userId }: { userId?: string }) {
  useEffect(() => {
    if (!userId) return

    const markComplete = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', userId)
      } catch (error) {
        // Error marking tour as complete
      }
    }

    markComplete()
  }, [userId])

  return null
}
