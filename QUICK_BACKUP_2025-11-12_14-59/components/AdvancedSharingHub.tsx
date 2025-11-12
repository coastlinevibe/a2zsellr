'use client'

import { useState, useEffect } from 'react'
import { Share2, MessageCircle, Facebook, Instagram, Twitter, Linkedin, Copy, QrCode, Calendar, Clock, Users, TrendingUp, Eye, Heart, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// QR Code will be generated using a simple canvas approach
// import QRCode from 'qrcode' // Removed to avoid dependency

interface SharingPlatform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  enabled: boolean
  connected: boolean
  followers?: number
  engagement_rate?: number
}

interface ShareContent {
  title: string
  description: string
  url: string
  image_url?: string
  hashtags: string[]
  mentions: string[]
}

interface SharingSchedule {
  platform: string
  date: string
  time: string
  status: 'scheduled' | 'sent' | 'failed'
  reach?: number
  engagement?: number
}

interface AdvancedSharingHubProps {
  content: ShareContent
  onScheduleShare: (platform: string, date: string, time: string) => void
  onShareNow: (platforms: string[]) => void
}

export function AdvancedSharingHub({ content, onScheduleShare, onShareNow }: AdvancedSharingHubProps) {
  const [platforms, setPlatforms] = useState<SharingPlatform[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-green-500',
      enabled: true,
      connected: true,
      followers: 0,
      engagement_rate: 85
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-600',
      enabled: true,
      connected: true,
      followers: 1250,
      engagement_rate: 12
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-pink-500',
      enabled: false,
      connected: false,
      followers: 890,
      engagement_rate: 8
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-blue-400',
      enabled: false,
      connected: false,
      followers: 450,
      engagement_rate: 6
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-700',
      enabled: false,
      connected: false,
      followers: 320,
      engagement_rate: 15
    }
  ])

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['whatsapp', 'facebook'])
  const [schedules, setSchedules] = useState<SharingSchedule[]>([
    {
      platform: 'facebook',
      date: '2025-11-07',
      time: '09:00',
      status: 'scheduled',
      reach: 0,
      engagement: 0
    },
    {
      platform: 'whatsapp',
      date: '2025-11-06',
      time: '14:30',
      status: 'sent',
      reach: 45,
      engagement: 12
    }
  ])

  const [qrCode, setQrCode] = useState<string>('')
  const [shareUrl, setShareUrl] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  useEffect(() => {
    // Generate simple QR code placeholder (would need qrcode library for real implementation)
    if (content.url) {
      // For now, use a placeholder QR code service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content.url)}`
      setQrCode(qrUrl)
    }

    // Generate shareable URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    setShareUrl(`${baseUrl}/listing/${content.url}`)
  }, [content.url])

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const generateShareText = (platform: string) => {
    const hashtags = content.hashtags.map(tag => `#${tag}`).join(' ')
    const mentions = content.mentions.map(mention => `@${mention}`).join(' ')
    
    let text = `${content.title}\n\n${content.description}`
    
    if (platform === 'twitter') {
      // Twitter character limit
      const maxLength = 280 - shareUrl.length - hashtags.length - 10
      if (text.length > maxLength) {
        text = text.substring(0, maxLength - 3) + '...'
      }
    }
    
    return `${text}\n\n${hashtags} ${mentions}\n\n${shareUrl}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const shareToNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: shareUrl
        })
      } catch (err) {
        console.error('Native share failed:', err)
      }
    }
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generateShareText('whatsapp'))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText('twitter'))
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl)
    const title = encodeURIComponent(content.title)
    const summary = encodeURIComponent(content.description)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank')
  }

  const handleScheduleShare = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select date and time')
      return
    }

    selectedPlatforms.forEach(platform => {
      onScheduleShare(platform, scheduleDate, scheduleTime)
      
      // Add to local schedules
      setSchedules(prev => [...prev, {
        platform,
        date: scheduleDate,
        time: scheduleTime,
        status: 'scheduled',
        reach: 0,
        engagement: 0
      }])
    })

    setShowScheduler(false)
    setScheduleDate('')
    setScheduleTime('')
  }

  const handleShareNow = () => {
    onShareNow(selectedPlatforms)
    
    // Execute platform-specific sharing
    selectedPlatforms.forEach(platform => {
      switch (platform) {
        case 'whatsapp':
          shareToWhatsApp()
          break
        case 'facebook':
          shareToFacebook()
          break
        case 'twitter':
          shareToTwitter()
          break
        case 'linkedin':
          shareToLinkedIn()
          break
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Advanced Sharing Hub
          </h2>
          <p className="text-gray-600">Share your content across multiple platforms</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800">Premium Feature</Badge>
      </div>

      {/* Content Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Content Preview</h3>
        <div className="flex gap-4">
          {content.image_url && (
            <img 
              src={content.image_url} 
              alt="Content preview" 
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{content.title}</h4>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{content.description}</p>
            <div className="flex gap-2 mt-2">
              {content.hashtags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlatforms.includes(platform.id)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!platform.connected ? 'opacity-50' : ''}`}
              onClick={() => platform.connected && togglePlatform(platform.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg text-white ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <span className="font-medium">{platform.name}</span>
                </div>
                {selectedPlatforms.includes(platform.id) && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              {platform.connected ? (
                <div className="space-y-1 text-sm text-gray-600">
                  {platform.followers !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {platform.followers.toLocaleString()} followers
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {platform.engagement_rate}% engagement
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  <Button variant="outline" size="sm" className="w-full">
                    Connect Account
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sharing Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleShareNow}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={selectedPlatforms.length === 0}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Now ({selectedPlatforms.length} platforms)
            </Button>
            
            <Button
              onClick={() => setShowScheduler(!showScheduler)}
              variant="outline"
              className="w-full"
              disabled={selectedPlatforms.length === 0}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Share
            </Button>
            
            <Button
              onClick={shareToNative}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Native Share
            </Button>
            
            <Button
              onClick={() => copyToClipboard(shareUrl)}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* QR Code & Link */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">QR Code & Link</h3>
          <div className="text-center space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
              </div>
            )}
            <div className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
              {shareUrl}
            </div>
            <Button
              onClick={() => copyToClipboard(shareUrl)}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy URL
            </Button>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      {showScheduler && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Schedule Share</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleScheduleShare} className="bg-emerald-600 hover:bg-emerald-700">
              Schedule
            </Button>
            <Button onClick={() => setShowScheduler(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Scheduled Posts */}
      {schedules.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Scheduled & Posted</h3>
          <div className="space-y-3">
            {schedules.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${
                    platforms.find(p => p.id === schedule.platform)?.color || 'bg-gray-500'
                  }`}>
                    {platforms.find(p => p.id === schedule.platform)?.icon}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{schedule.platform}</div>
                    <div className="text-sm text-gray-600">
                      {schedule.date} at {schedule.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {schedule.status === 'sent' && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {schedule.reach}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {schedule.engagement}
                      </div>
                    </div>
                  )}
                  <Badge className={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Message */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Custom Message (Optional)</h3>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={3}
          placeholder="Add a custom message to accompany your share..."
        />
        <div className="mt-2 text-sm text-gray-500">
          This message will be added to the beginning of your share text
        </div>
      </div>
    </div>
  )
}
