'use client'

import React, { useState } from 'react'
import { 
  Clock, 
  Calendar, 
  Repeat, 
  Zap, 
  Target, 
  TrendingUp,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Helper functions for time format conversion
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${ampm}`
}

const formatTimeTo24Hour = (time12: string): string => {
  if (!time12) return ''
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time12 // Return as-is if not in expected format
  
  const [, hour, minutes, ampm] = match
  let hour24 = parseInt(hour, 10)
  
  if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
    hour24 += 12
  } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
    hour24 = 0
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`
}

// Custom time picker component with AM/PM display
const TimePickerAMPM = ({ 
  value, 
  onChange, 
  className 
}: { 
  value: string
  onChange: (value: string) => void
  className?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const displayTime = formatTimeTo12Hour(value)

  const handleTimeChange = (newTime: string) => {
    const time24 = formatTimeTo24Hour(newTime)
    onChange(time24)
    setIsOpen(false)
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const minuteStr = minute.toString().padStart(2, '0')
        options.push(`${hour}:${minuteStr} AM`)
        options.push(`${hour}:${minuteStr} PM`)
      }
    }
    return options
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={displayTime}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        className={`cursor-pointer ${className}`}
        placeholder="Select time"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto w-32">
          {generateTimeOptions().map((timeOption) => (
            <div
              key={timeOption}
              onClick={() => handleTimeChange(timeOption)}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {timeOption}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ScheduleSettings {
  whatsapp: {
    time: string
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    timezone: string
    autoSend: boolean
    targetAudience: string[]
  }
}

const ListingScheduler = ({ onSchedule }: { onSchedule: (settings: ScheduleSettings) => void }) => {
  const [activeTab, setActiveTab] = useState('timing')
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    whatsapp: {
      time: '09:00',
      frequency: 'once',
      timezone: 'Africa/Johannesburg',
      autoSend: false,
      targetAudience: ['local', 'interests']
    }
  })

  const [aiOptimization, setAiOptimization] = useState({
    enabled: true,
    sendTimeOptimization: true,
    audienceOptimization: true,
    contentOptimization: true
  })

  const tabs = [
    { id: 'timing', name: 'Timing', icon: Clock },
    { id: 'targeting', name: 'Targeting', icon: Target },
    { id: 'automation', name: 'AI Magic', icon: Zap }
  ]

  const peakTimes = {
    whatsapp: [
      { time: '09:00', engagement: 85, label: 'Morning Check' },
      { time: '12:30', engagement: 78, label: 'Lunch Break' },
      { time: '18:00', engagement: 92, label: 'Evening Peak' },
      { time: '21:00', engagement: 67, label: 'Night Wind-down' }
    ]
  }

  const targetingOptions = [
    { id: 'local', name: 'Local Area', icon: MapPin, description: '5km radius from business' },
    { id: 'interests', name: 'Similar Interests', icon: TrendingUp, description: 'People interested in your category' },
    { id: 'demographics', name: 'Age & Gender', icon: Users, description: 'Target specific demographics' },
    { id: 'devices', name: 'Device Type', icon: Smartphone, description: 'Mobile vs Desktop users' },
    { id: 'behavior', name: 'Shopping Behavior', icon: Globe, description: 'Online shopping patterns' }
  ]

  const handleScheduleUpdate = (platform: keyof ScheduleSettings, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }

  const launchCampaign = () => {
    onSchedule(schedule)
    alert('🚀 Campaign launched! Your messages will be sent at the optimal times.')
  }

  return (
    <div className="bg-white rounded-[9px] shadow-lg border border-gray-200 overflow-hidden">
      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Timing Tab */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* WhatsApp Timing */}
              <div className="bg-green-50 rounded-[9px] p-5 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  WhatsApp
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Time</label>
                    <TimePickerAMPM
                      value={schedule.whatsapp.time}
                      onChange={(value) => handleScheduleUpdate('whatsapp', 'time', value)}
                      className="w-full p-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={schedule.whatsapp.frequency}
                      onChange={(e) => handleScheduleUpdate('whatsapp', 'frequency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="once">Send Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Peak Times */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">📊 Peak Engagement Times</p>
                  <div className="space-y-1">
                    {peakTimes.whatsapp.map((peak) => (
                      <button
                        key={peak.time}
                        onClick={() => handleScheduleUpdate('whatsapp', 'time', peak.time)}
                        className="w-full text-left p-2 rounded-[9px] hover:bg-green-100 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{peak.time}</span>
                          <span className="text-xs text-green-600">{peak.engagement}%</span>
                        </div>
                        <p className="text-xs text-gray-500">{peak.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Targeting Tab */}
        {activeTab === 'targeting' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Audience Targeting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targetingOptions.map((option) => {
                const Icon = option.icon
                const isSelected = schedule.whatsapp.targetAudience.includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newAudience = isSelected
                        ? schedule.whatsapp.targetAudience.filter(id => id !== option.id)
                        : [...schedule.whatsapp.targetAudience, option.id]
                      handleScheduleUpdate('whatsapp', 'targetAudience', newAudience)
                    }}
                    className={`p-4 rounded-[9px] border-2 transition-all text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{option.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Magic Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-[9px] p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                AI Optimization
              </h3>
              <div className="space-y-4">
                {Object.entries(aiOptimization).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <p className="text-sm text-gray-500">
                        {key === 'enabled' && 'Enable AI-powered optimizations'}
                        {key === 'sendTimeOptimization' && 'AI picks the best times to send'}
                        {key === 'audienceOptimization' && 'AI finds your ideal audience'}
                        {key === 'contentOptimization' && 'AI improves your message copy'}
                      </p>
                    </div>
                    <button
                      onClick={() => setAiOptimization(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-blue-50 rounded-[9px] p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">🔮 AI Predictions</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Expected Reach</span>
                  <span className="font-semibold text-blue-600">2,500 - 3,200 people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Engagement Rate</span>
                  <span className="font-semibold text-green-600">15-22%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Conversion Rate</span>
                  <span className="font-semibold text-purple-600">3-7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Estimated Revenue</span>
                  <span className="font-semibold text-emerald-600">R1,200 - R2,800</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            Campaign will launch in {aiOptimization.enabled ? 'AI-optimized' : 'scheduled'} mode
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-[9px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={launchCampaign}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px]"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingScheduler
