'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Users, Settings, CheckCircle2, AlertCircle, ShoppingCart, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface PreviewStepProps {
  state: any
}

interface UserProfile {
  subscription_tier: 'free' | 'premium' | 'business'
}

interface Product {
  id: string
  name: string
  price_cents?: number
  image_url?: string
  description?: string
}

interface Listing {
  id: string
  title: string
  message_template?: string
  uploaded_media?: Array<{ url: string }>
}

export default function PreviewStep({ state }: PreviewStepProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Fetch user profile to check tier
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Profile fetch error:', error)
          return
        }
        
        setProfile(data as UserProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user?.id])

  const userTier = profile?.subscription_tier || 'free'
  const maxGroups = userTier === 'business' ? Infinity : userTier === 'premium' ? 2 : 0
  const groupsExceedLimit = state.recipientType === 'groups' && state.selectedGroups.length > maxGroups
  const tierViolation = groupsExceedLimit || (state.recipientType === 'groups' && userTier === 'free')

  // Fetch products and listings
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true)
      try {
        if (state.contentType === 'product' && state.selectedProducts.length > 0) {
          const { data } = await supabase
            .from('profile_products')
            .select('*')
            .in('id', state.selectedProducts)
          setProducts(data || [])
        } else if (state.contentType === 'listing' && state.selectedListings.length > 0) {
          const { data } = await supabase
            .from('profile_listings')
            .select('*')
            .in('id', state.selectedListings)
          setListings(data || [])
        }
      } catch (error) {
        console.error('Error fetching items:', error)
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [state.contentType, state.selectedProducts, state.selectedListings])

  const getContentTypeLabel = () => {
    switch (state.contentType) {
      case 'product':
        return `${state.selectedProducts.length} Product(s)`
      case 'listing':
        return `${state.selectedListings.length} Listing(s)`
      case 'custom':
        return 'Custom Message'
      default:
        return 'Unknown'
    }
  }

  const getRecipientTypeLabel = () => {
    switch (state.recipientType) {
      case 'groups':
        return `${state.selectedGroups.length} Group(s)`
      case 'contacts':
        return `${state.selectedContacts.length} Contact(s)`
      case 'custom':
        return `${state.customNumbers.length} Number(s)`
      default:
        return 'Unknown'
    }
  }

  const getSendModeLabel = () => {
    if (state.sendMode === 'now') {
      return 'Send Immediately'
    } else if (state.sendMode === 'schedule') {
      const date = new Date(state.scheduleDateTime)
      return `Scheduled for ${date.toLocaleString()}`
    }
    return 'Unknown'
  }

  const getDeliveryModeLabel = () => {
    return state.deliveryMode === 'safe' ? 'Safe Mode (Throttled)' : 'Fast Mode (Optimized)'
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Campaign</h2>
        <p className="text-gray-600">Verify all details before sending</p>
      </div>

      {/* Tier Violation Warning */}
      {tierViolation && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Crown className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 mb-2">Tier Limit Exceeded</p>
              {userTier === 'free' && (
                <p className="text-sm text-red-800">
                  Free tier cannot send to groups. Please upgrade to Premium (2 groups) or Business (unlimited groups).
                </p>
              )}
              {userTier === 'premium' && groupsExceedLimit && (
                <p className="text-sm text-red-800">
                  Premium tier allows maximum 2 groups. You have selected {state.selectedGroups.length} groups. Please reduce your selection or upgrade to Business.
                </p>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Campaign Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Content</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Type</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{state.contentType}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Quantity</p>
              <p className="text-lg font-bold text-gray-900">{getContentTypeLabel()}</p>
            </div>

            {state.contentType === 'custom' && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Message Preview</p>
                <div className="bg-white border border-blue-200 rounded p-3 mt-2 max-h-24 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{state.customMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Who Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Recipients</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Type</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{state.recipientType}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Count</p>
              <p className="text-lg font-bold text-gray-900">{getRecipientTypeLabel()}</p>
            </div>

            <div className="bg-white border border-green-200 rounded p-3">
              <p className="text-xs text-gray-600">
                ✓ Recipients will receive your message via WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* How Section - Send Mode */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Send Timing</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Mode</p>
              <p className="text-lg font-bold text-gray-900">{getSendModeLabel()}</p>
            </div>

            {state.sendMode === 'schedule' && (
              <div className="bg-white border border-purple-200 rounded p-3">
                <p className="text-xs text-gray-600">
                  ⏰ Message will be queued and sent at the scheduled time
                </p>
              </div>
            )}

            {state.sendMode === 'now' && (
              <div className="bg-white border border-purple-200 rounded p-3">
                <p className="text-xs text-gray-600">
                  ⚡ Message will be sent immediately
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How Section - Delivery Mode */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Delivery Mode</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Mode</p>
              <p className="text-lg font-bold text-gray-900">{getDeliveryModeLabel()}</p>
            </div>

            <div className="bg-white border border-orange-200 rounded p-3">
              <p className="text-xs text-gray-600">
                {state.deliveryMode === 'safe'
                  ? '🛡️ Slower delivery with rate limiting to ensure reliability'
                  : '⚡ Faster delivery with optimized throttling'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Campaign Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded p-4 text-center">
            <p className="text-xs text-gray-600 font-semibold">Total Recipients</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {(state.selectedGroups.length || 0) + (state.selectedContacts.length || 0) + (state.customNumbers.length || 0)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4 text-center">
            <p className="text-xs text-gray-600 font-semibold">Content Type</p>
            <p className="text-lg font-bold text-gray-900 mt-2 capitalize">{state.contentType}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4 text-center">
            <p className="text-xs text-gray-600 font-semibold">Send Mode</p>
            <p className="text-lg font-bold text-gray-900 mt-2 capitalize">{state.sendMode}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4 text-center">
            <p className="text-xs text-gray-600 font-semibold">Delivery</p>
            <p className="text-lg font-bold text-gray-900 mt-2 capitalize">{state.deliveryMode}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Checklist */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Confirmation Checklist
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Content is ready to send</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Recipients have been selected</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Send timing and delivery mode configured</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              {state.sendMode === 'schedule'
                ? 'Your device must remain connected until the scheduled time'
                : 'Sending will begin immediately after confirmation'}
            </p>
          </div>
        </div>
      </div>

      {/* Final Warning */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">⚠️ Important:</span> Once you click "Send", your campaign will be queued for delivery. You can monitor the status in your WhatsApp dashboard.
        </p>
      </div>
    </div>
  )
}
