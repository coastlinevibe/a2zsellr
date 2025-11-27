'use client'

import { useEffect, useState } from 'react'
import { Zap, Calendar, Crown, MessageSquare, Shield } from 'lucide-react'
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

  // Calculate number of messages being sent
  const messageCount = (state.selectedProducts?.length || 0) + (state.selectedListings?.length || 0) + (state.customMessage ? 1 : 0)
  const isSingleMessage = messageCount <= 1
  const isScheduleMode = state.sendMode === 'schedule'

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

      {/* Delivery Speed (for multiple messages) */}
      {!isSingleMessage && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">⚡ How fast?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onUpdate({ deliveryMode: 'safe' })}
              disabled={!isPremiumOrBusiness}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                state.deliveryMode === 'safe'
                  ? 'border-green-500 bg-green-100'
                  : 'border-gray-300 bg-white hover:border-green-300'
              } ${!isPremiumOrBusiness ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${state.deliveryMode === 'safe' ? 'bg-green-200' : 'bg-gray-100'}`}>
                  <Shield className={`w-6 h-6 ${state.deliveryMode === 'safe' ? 'text-green-700' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Safe Mode</h4>
                  <p className="text-sm text-gray-600">3-5 min between messages</p>
                  <p className="text-xs text-gray-500 mt-1">Safest for large campaigns</p>
                </div>
                {state.deliveryMode === 'safe' && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => onUpdate({ deliveryMode: 'fast' })}
              disabled={!isBusinessUser}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                state.deliveryMode === 'fast'
                  ? 'border-orange-500 bg-orange-100'
                  : 'border-gray-300 bg-white hover:border-orange-300'
              } ${!isBusinessUser ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${state.deliveryMode === 'fast' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                  <Zap className={`w-6 h-6 ${state.deliveryMode === 'fast' ? 'text-orange-700' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Fast Mode</h4>
                  <p className="text-sm text-gray-600">30-60 sec between messages</p>
                  <p className="text-xs text-gray-500 mt-1">Business only - risky</p>
                </div>
                {state.deliveryMode === 'fast' && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
          {!isBusinessUser && state.deliveryMode === 'fast' && (
            <button
              onClick={() => alert('Upgrade to Business tier to use Fast Mode')}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs px-2 py-1 rounded-lg border border-blue-700 font-bold flex items-center gap-1 shadow-lg"
            >
              <Crown className="w-3 h-3" />
              BUSINESS
            </button>
          )}
        </div>
      )}

      {/* Multiple Messages Info */}
      {!isSingleMessage && (
        <div className="space-y-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <p className="text-sm font-semibold text-purple-900">📨 Message Sequence</p>
          
          {/* Message Order */}
          <div className="bg-white p-3 rounded border border-purple-300 space-y-2">
            <p className="text-xs font-medium text-gray-600">Messages will be sent in this order:</p>
            <div className="space-y-2 mt-2">
              {state.selectedProducts.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">1</span>
                  <span className="text-sm text-gray-700 font-medium">{state.selectedProducts.length} Product{state.selectedProducts.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {state.selectedListings.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">{state.selectedProducts.length > 0 ? '2' : '1'}</span>
                  <span className="text-sm text-gray-700 font-medium">{state.selectedListings.length} Listing{state.selectedListings.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {state.customMessage && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">{(state.selectedProducts.length > 0 ? 1 : 0) + (state.selectedListings.length > 0 ? 1 : 0) + 1}</span>
                  <span className="text-sm text-gray-700 font-medium">1 Custom Message</span>
                </div>
              )}
            </div>
          </div>

          {/* Interval Selection */}
          <div className="bg-white p-3 rounded border border-purple-300 space-y-2">
            <p className="text-xs font-medium text-gray-600">Interval between each message:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => onUpdate({ messageInterval: 'slow' })}
                className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                  state.messageInterval === 'slow'
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">Slow</div>
                <div className="text-xs">3-5 min</div>
              </button>
              <button
                onClick={() => onUpdate({ messageInterval: 'medium' })}
                className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                  state.messageInterval === 'medium'
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">Medium</div>
                <div className="text-xs">1-2 min</div>
              </button>
              <button
                onClick={() => onUpdate({ messageInterval: 'fast' })}
                className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                  state.messageInterval === 'fast'
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">Fast</div>
                <div className="text-xs">30-60 sec</div>
              </button>
              <button
                onClick={() => onUpdate({ messageInterval: 'veryfast' })}
                className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                  state.messageInterval === 'veryfast'
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">Very Fast</div>
                <div className="text-xs">10-20 sec</div>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 p-2 bg-amber-50 rounded border border-amber-200">
              ⚠️ <span className="font-medium">Recommended:</span> Use "Slow" or "Medium" to avoid account restrictions. Faster intervals may trigger WhatsApp rate limits.
            </p>
          </div>
        </div>
      )}

      {/* Time Interval Info (for multiple recipients) - Only show if single message */}
      {totalRecipients > 1 && state.deliveryMode && isSingleMessage && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm font-semibold text-blue-900">⏱️ Delivery Timing</p>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              You're sending to <span className="font-bold">{totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}</span>
            </p>
            <div className="bg-white p-3 rounded border border-blue-300">
              <p className="text-sm font-medium text-gray-900">
                Interval between recipients: <span className="text-blue-600 font-bold">{timeInterval} {state.deliveryMode === 'safe' ? 'minutes' : 'seconds'}</span>
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

      {/* Recipient Interval Info (for single message to multiple recipients) */}
      {isSingleMessage && totalRecipients > 1 && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-sm font-semibold text-blue-900">⏱️ Delivery Timing</p>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              You're sending to <span className="font-bold">{totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}</span>
            </p>
            
            {/* Interval Selection */}
            <div className="bg-white p-3 rounded border border-blue-300 space-y-2">
              <p className="text-xs font-medium text-gray-600">Interval between each recipient:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdate({ recipientInterval: 'slow' })}
                  className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                    state.recipientInterval === 'slow'
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold">Slow</div>
                  <div className="text-xs">3-5 min</div>
                </button>
                <button
                  onClick={() => onUpdate({ recipientInterval: 'medium' })}
                  className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                    state.recipientInterval === 'medium'
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold">Medium</div>
                  <div className="text-xs">1-2 min</div>
                </button>
                <button
                  onClick={() => onUpdate({ recipientInterval: 'fast' })}
                  className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                    state.recipientInterval === 'fast'
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold">Fast</div>
                  <div className="text-xs">30-60 sec</div>
                </button>
                <button
                  onClick={() => onUpdate({ recipientInterval: 'veryfast' })}
                  className={`p-2 rounded border-2 text-xs font-medium transition-all ${
                    state.recipientInterval === 'veryfast'
                      ? 'border-blue-500 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="font-bold">Very Fast</div>
                  <div className="text-xs">10-20 sec</div>
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                ⚠️ <span className="font-medium">Recommended:</span> Use "Slow" or "Medium" to avoid account restrictions. Faster intervals may trigger WhatsApp rate limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
        <p className="text-sm font-semibold text-gray-900">ℹ️ How It Works:</p>
        <div className="space-y-3 text-sm text-gray-700">
          {isSingleMessage && !isScheduleMode && (
            <div className="flex gap-3">
              <Zap className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Single Message</p>
                <p className="text-gray-600">Your message will be sent immediately to all recipients with minimal delay between each.</p>
              </div>
            </div>
          )}
          {!isSingleMessage && (
            <div className="flex gap-3">
              <MessageSquare className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Multiple Messages</p>
                <p className="text-gray-600">Each message will be sent to all recipients with a delay between messages to look natural.</p>
              </div>
            </div>
          )}
          {!isSingleMessage && state.deliveryMode && (
            <div className="flex gap-3">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{state.deliveryMode === 'safe' ? 'Safe Mode' : 'Fast Mode'}</p>
                <p className="text-gray-600">
                  {state.deliveryMode === 'safe' 
                    ? 'Slower delivery with 2-5 minute intervals between messages to avoid rate limits.'
                    : 'Faster delivery with 30-60 second intervals between messages.'
                  }
                </p>
              </div>
            </div>
          )}
          {isScheduleMode && (
            <div className="flex gap-3">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Scheduled Delivery</p>
                <p className="text-gray-600">Messages will be queued and sent at your scheduled time. Keep the page open for scheduled messages to send.</p>
              </div>
            </div>
          )}
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
