'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ShareLinkBuilder from '@/components/ui/share-link-builder'
import CampaignScheduler from '@/components/ui/campaign-scheduler'
import AnalyticsDashboard from '@/components/ui/analytics-dashboard'
import { 
  Sparkles, 
  Zap, 
  Target, 
  BarChart3, 
  Settings,
  Crown,
  Rocket,
  TrendingUp,
  Users,
  MessageCircle,
  Share2,
  Calendar,
  Eye,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  category: string | null
}

interface UserProfile {
  id: string
  display_name: string
  email: string | null
  avatar_url: string | null
  bio: string | null
  business_category: string | null
  business_location: string | null
  phone_number: string | null
  website_url: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  verified_seller: boolean
  early_adopter: boolean
}

const ShareBuilderPage = () => {
  const [activeView, setActiveView] = useState('builder')
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Get user products
        const { data: productsData } = await supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsData) {
          setProducts(productsData)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const views = [
    { 
      id: 'builder', 
      name: 'Create Campaign', 
      icon: Sparkles,
      description: 'Build viral campaigns',
      color: 'emerald'
    },
    { 
      id: 'scheduler', 
      name: 'Schedule & Automate', 
      icon: Calendar,
      description: 'AI-powered timing',
      color: 'blue'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: BarChart3,
      description: 'Track performance',
      color: 'purple'
    }
  ]

  const quickStats = [
    { label: 'Active Campaigns', value: '3', icon: Rocket, color: 'emerald' },
    { label: 'Total Reach', value: '12.4K', icon: Users, color: 'blue' },
    { label: 'Conversion Rate', value: '8.2%', icon: Target, color: 'purple' },
    { label: 'Revenue', value: 'R24.5K', icon: TrendingUp, color: 'green' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-[9px] h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your viral toolkit...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access the Share Link Builder</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px]">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-emerald-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-[9px] animate-pulse"></div>
                </div>
                Ultra-Premium Share Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create viral campaigns that drive real results • Welcome back, {profile?.display_name}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              {profile?.subscription_tier === 'business' && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-[9px] font-medium">
                  <Crown className="w-4 h-4" />
                  Business Pro
                </div>
              )}
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-[9px] font-medium">
                <Zap className="w-5 h-5 mr-2" />
                Go Viral Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-[9px] bg-${stat.color}-50`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="flex">
            {views.map((view) => {
              const Icon = view.icon
              const isActive = activeView === view.id
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex-1 p-6 text-center transition-all relative ${
                    isActive
                      ? `bg-${view.color}-50 text-${view.color}-700 border-b-4 border-${view.color}-500`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    isActive ? `text-${view.color}-600` : 'text-gray-400'
                  }`} />
                  <h3 className="font-semibold text-lg">{view.name}</h3>
                  <p className="text-sm mt-1 opacity-75">{view.description}</p>
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeView === 'builder' && (
            <div>
              <ShareLinkBuilder products={products} businessProfile={profile} />
            </div>
          )}

          {activeView === 'scheduler' && (
            <div>
              <CampaignScheduler onSchedule={(settings) => {
                console.log('Campaign scheduled:', settings)
                alert('🎉 Campaign scheduled successfully! Your messages will be sent at optimal times.')
              }} />
            </div>
          )}

          {activeView === 'analytics' && (
            <div>
              <AnalyticsDashboard />
            </div>
          )}
        </div>

        {/* Success Stories */}
        <div className="mt-16 bg-white rounded-[9px] shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏆 Success Stories from Our Users
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                business: "Mama's Kitchen",
                result: "300% more orders",
                quote: "WhatsApp campaigns brought customers directly to my door!",
                revenue: "R45K in 30 days"
              },
              {
                business: "Tech Repairs Pro",
                result: "500% booking increase",
                quote: "Facebook campaigns filled my calendar for months ahead.",
                revenue: "R78K in 45 days"
              },
              {
                business: "Fashion Boutique",
                result: "800% social growth",
                quote: "Instagram campaigns made us the talk of the town!",
                revenue: "R120K in 60 days"
              }
            ].map((story, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-[9px] p-6 border border-emerald-200">
                <div className="text-center">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{story.business}</h4>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{story.result}</div>
                  <p className="text-gray-600 italic mb-4">"{story.quote}"</p>
                  <div className="bg-white rounded-[9px] px-4 py-2 inline-block">
                    <span className="font-bold text-green-600">{story.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[9px] p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl text-emerald-100 mb-6">
            Join thousands of businesses already going viral with our Ultra-Premium Share Builder
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={() => setActiveView('builder')}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-[9px] font-bold text-lg"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareBuilderPage
