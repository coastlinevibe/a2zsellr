'use client'

import { useState } from 'react'
import { Crown, Image, Video, Share2, BarChart3, ShoppingCart, Calendar, Users, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GallerySlider } from '@/components/ui/gallery-slider'
import { EnhancedListingCreator } from '@/components/EnhancedListingCreator'
import { AdvancedSharingHub } from '@/components/AdvancedSharingHub'
import { MarketingAnalytics } from '@/components/MarketingAnalytics'
import { CampaignDashboard } from '@/components/CampaignDashboard'

interface PremiumFeaturesHubProps {
  userTier: 'free' | 'premium' | 'business'
  onUpgrade: () => void
}

interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'available' | 'upgrade_required'
  component?: React.ReactNode
  benefits: string[]
}

export function PremiumFeaturesHub({ userTier, onUpgrade }: PremiumFeaturesHubProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'enhanced-gallery',
      title: 'Enhanced Gallery System',
      description: 'Advanced gallery with slider, fullscreen viewer, and unlimited images',
      icon: <Image className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Unlimited image uploads',
        'Interactive gallery slider',
        'Fullscreen viewer with zoom',
        'Auto-play and navigation controls',
        'Mobile-optimized viewing'
      ]
    },
    {
      id: 'video-support',
      title: 'Video Content Support',
      description: 'Upload and showcase videos in your listings and gallery',
      icon: <Video className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Video upload support',
        'Automatic thumbnail generation',
        'Video playback controls',
        'Multiple video formats',
        'Optimized streaming'
      ]
    },
    {
      id: 'advanced-sharing',
      title: 'Advanced Sharing Hub',
      description: 'Share across multiple platforms with scheduling and analytics',
      icon: <Share2 className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Multi-platform sharing',
        'QR code generation',
        'Share scheduling',
        'Custom messages',
        'Platform-specific formatting'
      ]
    },
    {
      id: 'ecommerce',
      title: 'Full E-Commerce',
      description: 'Complete shopping cart and checkout system',
      icon: <ShoppingCart className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Shopping cart functionality',
        'Secure checkout process',
        'Order management',
        'PayFast integration',
        'Multi-business orders'
      ]
    },
    {
      id: 'campaign-management',
      title: 'Campaign Management',
      description: 'WhatsApp & Facebook marketing campaigns with automation',
      icon: <Calendar className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Campaign creation & scheduling',
        'WhatsApp & Facebook targeting',
        'n8n automation integration',
        'Daily messaging limits',
        'Group management'
      ]
    },
    {
      id: 'marketing-analytics',
      title: 'Marketing Analytics',
      description: 'Comprehensive performance tracking and insights',
      icon: <BarChart3 className="w-6 h-6" />,
      status: userTier === 'premium' || userTier === 'business' ? 'available' : 'upgrade_required',
      benefits: [
        'Performance dashboards',
        'Platform-specific metrics',
        'Campaign analytics',
        'Demographic insights',
        'Export capabilities'
      ]
    }
  ]

  const handleFeatureClick = (featureId: string) => {
    const feature = premiumFeatures.find(f => f.id === featureId)
    if (feature?.status === 'upgrade_required') {
      onUpgrade()
    } else {
      setActiveFeature(activeFeature === featureId ? null : featureId)
    }
  }

  const demoContent = {
    title: 'Premium Business Showcase',
    description: 'Experience the power of premium features with this interactive demo',
    url: 'demo-listing-123',
    image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    hashtags: ['premium', 'business', 'showcase'],
    mentions: ['a2zbusiness']
  }

  const demoImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    'https://images.unsplash.com/photo-1560472355-536de3962603?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Premium Features</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of your business with our premium features designed to maximize your reach and revenue.
        </p>
        
        {userTier === 'free' && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade to Premium Today!</h3>
            <p className="text-gray-600 mb-4">
              Get access to all premium features for just <strong>R149/month</strong>
            </p>
            <Button onClick={onUpgrade} className="bg-emerald-600 hover:bg-emerald-700">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature) => (
          <div
            key={feature.id}
            className={`bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
              feature.status === 'available' 
                ? 'border-emerald-200 hover:border-emerald-300' 
                : 'border-gray-200 hover:border-gray-300'
            } ${activeFeature === feature.id ? 'ring-2 ring-emerald-500' : ''}`}
            onClick={() => handleFeatureClick(feature.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                feature.status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {feature.icon}
              </div>
              <Badge className={
                feature.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }>
                {feature.status === 'available' ? 'Available' : 'Premium'}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
            
            <div className="space-y-2">
              {feature.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    feature.status === 'available' ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}></div>
                  {benefit}
                </div>
              ))}
              {feature.benefits.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{feature.benefits.length - 3} more benefits
                </div>
              )}
            </div>
            
            {feature.status === 'upgrade_required' && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpgrade()
                  }}
                  size="sm" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Upgrade to Access
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Demo Section */}
      {(userTier === 'premium' || userTier === 'business') && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Interactive Demo
              </h2>
              <p className="text-gray-600">Try out your premium features with live examples</p>
            </div>
            <Button 
              onClick={() => setShowDemo(!showDemo)}
              variant={showDemo ? 'default' : 'outline'}
            >
              {showDemo ? 'Hide Demo' : 'Show Demo'}
            </Button>
          </div>

          {showDemo && (
            <div className="space-y-8">
              {/* Gallery Slider Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Gallery Slider</h3>
                <div className="max-w-md">
                  <GallerySlider
                    images={demoImages}
                    showThumbnails={true}
                    autoPlay={true}
                    autoPlayInterval={3000}
                    showControls={true}
                    showFullscreenButton={true}
                  />
                </div>
              </div>

              {/* Advanced Sharing Demo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Advanced Sharing Hub</h3>
                <AdvancedSharingHub
                  content={demoContent}
                  onScheduleShare={(platform, date, time) => {
                    console.log(`Scheduled ${platform} for ${date} at ${time}`)
                  }}
                  onShareNow={(platforms) => {
                    console.log(`Sharing to: ${platforms.join(', ')}`)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Details Modal */}
      {activeFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const feature = premiumFeatures.find(f => f.id === activeFeature)
                if (!feature) return null

                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveFeature(null)}
                        variant="outline"
                        size="sm"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {feature.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>

                      {feature.status === 'available' ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 font-medium">✅ This feature is available in your current plan!</p>
                          <p className="text-green-700 text-sm mt-1">
                            Start using this feature right away to enhance your business presence.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 font-medium">🔒 Premium Feature</p>
                          <p className="text-yellow-700 text-sm mt-1 mb-3">
                            Upgrade to Premium (R149/month) to unlock this powerful feature.
                          </p>
                          <Button onClick={onUpgrade} className="bg-emerald-600 hover:bg-emerald-700">
                            Upgrade Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Success Stories */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Premium Success Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">300%</div>
            <p className="text-gray-600">Average increase in customer engagement</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <p className="text-gray-600">Groups reached per campaign</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <p className="text-gray-600">Automated marketing campaigns</p>
          </div>
        </div>
      </div>
    </div>
  )
}
