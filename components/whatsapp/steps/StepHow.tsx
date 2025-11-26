'use client'

import { useEffect, useState } from 'react'
import { Zap, Shield, Calendar, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface StepHowProps {
  state: any
  onUpdate: (updates: any) => void
}

interface UserProfile {
  subscription_tier: 'free' | 'premium' | 'business'
}

export default function StepHow({ state, onUpdate }: StepHowProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Fetch user profile to check tier
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      try {
        // Import supabase from the lib
        const { supabase } = await import('@/lib/supabaseClient')
        
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Profile fetch error:', error)
          return
        }
        
        console.log('Profile fetched from Supabase:', data)
        setProfile(data as UserProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user?.id])

  const userTier = profile?.subscription_tier || 'free'
  const isBusinessUser = userTier === 'business'
  const isPremiumOrBusiness = userTier === 'premium' || userTier === 'business'
  
  console.log('StepHow tier check:', { userTier, isBusinessUser, isPremiumOrBusiness, profile })

  // Calculate time interval for multiple recipients
  const getTimeInterval = () => {
    const totalRecipients = (state.selectedGroups?.length || 0) + (state.selectedContacts?.length || 0)
    
    if (totalRecipients <= 1) return null
    
    if (state.deliveryMode === 'safe') {
      // Random interval between 2-5 minutes for safe mode
      return Math.floor(Math.random() * (5 - 2 + 1)) + 2 // 2-5 minutes
    } else if (state.deliveryMode === 'fast') {
      // Random interval between 30-60 seconds for fast mode
      return Math.floor(Math.random() * (60 - 30 + 1)) + 30 // 30-60 seconds
    }
    
    return null
  }

  const timeInterval = getTimeInterval()
  const totalRecipients = (state.selectedGroups?.length || 0) + (state.selectedContacts?.length || 0)

  const sendModeOptions = [
    {
      id: 'now',
      label: 'Send Right Now',
      description: 'Messages go out immediately',
      icon: Zap,
      color: 'green',
      disabled: false,
    },
    {
      id: 'schedule',
      label: 'Send Later',
      description: 'Pick a date and time (Business only)',
      icon: Calendar,
      color: 'blue',
      disabled: !isBusinessUser,
      businessOnly: true,
    },
  ]

  const deliveryModeOptions = [
    {
      id: 'safe',
      label: 'Safe & Slow',
      description: 'Safer for large groups, takes longer',
      icon: Shield,
      color: 'blue',
      disabled: false, // Always enabled for all tiers
    },
    {
      id: 'fast',
      label: 'Fast & Quick',
      description: 'Faster delivery (Premium & Business)',
      icon: Zap,
      color: 'orange',
      disabled: !isPremiumOrBusiness,
      premiumOnly: true,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ How should we send it?</h2>
        <p className="text-gray-600">Choose when and how fast</p>
      </div>

      {/* Send Mode Selection */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">⏰ When?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sendModeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = state.sendMode === option.id
            const isDisabled = option.disabled
            
            const colorMap = {
              green: { border: '#22c55e', bg: '#dcfce7', bgHover: '#bbf7d0', bgIcon: '#86efac', text: '#16a34a' },
              blue: { border: '#3b82f6', bg: '#dbeafe', bgHover: '#bfdbfe', bgIcon: '#93c5fd', text: '#1d4ed8' },
            }
            const colors = colorMap[option.color as keyof typeof colorMap]

            return (
              <div key={option.id} className="relative">
                <button
                  onClick={() => {
                    if (!isDisabled) {
                      onUpdate({ sendMode: option.id })
                      if (option.id === 'now') {
                        onUpdate({ scheduleDateTime: null })
                      }
                    }
                  }}
                  disabled={isDisabled}
                  style={{
                    borderColor: isSelected ? colors.border : isDisabled ? '#d1d5db' : '#e5e7eb',
                    backgroundColor: isSelected ? colors.bg : isDisabled ? '#f3f4f6' : '#ffffff',
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  className="w-full p-6 rounded-lg border-2 transition-all text-left disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div
                      style={{
                        backgroundColor: isSelected ? colors.bgIcon : '#f3f4f6',
                      }}
                      className="p-3 rounded-lg"
                    >
                      <Icon
                        style={{
                          color: isSelected ? colors.text : '#4b5563',
                        }}
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                {isDisabled && option.businessOnly && (
                  <button
                    onClick={() => alert('Upgrade to Business tier to use scheduling')}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs px-2 py-1 rounded-lg border border-blue-700 font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Crown className="w-3 h-3" />
                    BUSINESS
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Schedule DateTime (if schedule mode selected) */}
      {state.sendMode === 'schedule' && (
        <div className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-bold text-gray-900">Schedule Date & Time</h3>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Select Date & Time</label>
            <input
              type="datetime-local"
              value={state.scheduleDateTime || ''}
              onChange={(e) => {
                const selectedTime = new Date(e.target.value)
                const now = new Date()
                
                if (selectedTime <= now) {
                  alert('Please select a future date and time')
                  return
                }
                
                onUpdate({ scheduleDateTime: e.target.value })
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-600">
              Messages will be sent at the specified time. Make sure your device is connected.
            </p>
            {state.scheduleDateTime && (
              <div className="p-3 bg-white rounded-lg border border-blue-300">
                <p className="text-sm font-medium text-gray-900">
                  Scheduled for: {new Date(state.scheduleDateTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Mode Selection */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">🚀 How Fast?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryModeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = state.deliveryMode === option.id
            const isDisabled = option.disabled
            
            const colorMap = {
              blue: { border: '#3b82f6', bg: '#dbeafe', bgIcon: '#93c5fd', text: '#1d4ed8' },
              orange: { border: '#f97316', bg: '#fed7aa', bgIcon: '#fdba74', text: '#c2410c' },
            }
            const colors = colorMap[option.color as keyof typeof colorMap]

            return (
              <div key={option.id} className="relative">
                <button
                  onClick={() => {
                    if (!isDisabled) {
                      onUpdate({ deliveryMode: option.id })
                    }
                  }}
                  disabled={isDisabled}
                  style={{
                    borderColor: isSelected ? colors.border : isDisabled ? '#d1d5db' : '#e5e7eb',
                    backgroundColor: isSelected ? colors.bg : isDisabled ? '#f3f4f6' : '#ffffff',
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  className="w-full p-6 rounded-lg border-2 transition-all text-left disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div
                      style={{
                        backgroundColor: isSelected ? colors.bgIcon : '#f3f4f6',
                      }}
                      className="p-3 rounded-lg"
                    >
                      <Icon
                        style={{
                          color: isSelected ? colors.text : '#4b5563',
                        }}
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                {isDisabled && option.premiumOnly && (
                  <button
                    onClick={() => alert('Upgrade to Premium or Business tier to use Fast Mode')}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs px-2 py-1 rounded-lg border border-amber-700 font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Crown className="w-3 h-3" />
                    UPGRADE
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Time Interval Info (for multiple recipients) */}
      {totalRecipients > 1 && state.deliveryMode && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm font-semibold text-blue-900">⏱️ Message Scheduling</p>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              You're sending to <span className="font-bold">{totalRecipients} recipients</span>
            </p>
            <div className="bg-white p-3 rounded border border-blue-300">
              <p className="text-sm font-medium text-gray-900">
                Time Interval: <span className="text-blue-600 font-bold">{timeInterval} {state.deliveryMode === 'safe' ? 'minutes' : 'seconds'}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {state.deliveryMode === 'safe' 
                  ? 'Messages will be sent with 2-5 minute intervals to avoid rate limits'
                  : 'Messages will be sent with 30-60 second intervals for faster delivery'
                }
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Estimated total time: <span className="font-medium">{Math.ceil((totalRecipients - 1) * (timeInterval || 1) / (state.deliveryMode === 'safe' ? 60 : 1))} {state.deliveryMode === 'safe' ? 'minutes' : 'seconds'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Mode Info */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <p className="text-sm font-semibold text-gray-900">📊 Delivery Modes Explained:</p>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex gap-3">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Safe Mode</p>
              <p className="text-gray-600">Slower delivery with throttling to avoid rate limits. Available to all tiers.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Zap className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Fast Mode</p>
              <p className="text-gray-600">Faster delivery with optimized throttling. Available to Premium & Business tiers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Limits Info */}
      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">🎯 Tier Features:</span> Premium: Safe Mode only. Business: Safe Mode + Fast Mode + Scheduler.
        </p>
      </div>
    </div>
  )
}
