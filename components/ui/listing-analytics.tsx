'use client'

import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  DollarSign,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Award,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CampaignMetrics {
  id: string
  name: string
  platform: string
  status: 'active' | 'completed' | 'paused'
  metrics: {
    reach: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    engagement_rate: number
    ctr: number
    roas: number
  }
  timeline: {
    date: string
    reach: number
    clicks: number
    conversions: number
  }[]
}

const ListingAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  // Mock data - in real app this would come from API
  const campaigns: CampaignMetrics[] = [
    {
      id: '1',
      name: 'Summer Sale Blast',
      platform: 'whatsapp',
      status: 'active',
      metrics: {
        reach: 2847,
        impressions: 4521,
        clicks: 892,
        conversions: 127,
        revenue: 18450,
        engagement_rate: 24.5,
        ctr: 19.7,
        roas: 4.2
      },
      timeline: [
        { date: '2024-01-01', reach: 450, clicks: 89, conversions: 12 },
        { date: '2024-01-02', reach: 523, clicks: 103, conversions: 18 },
        { date: '2024-01-03', reach: 612, clicks: 121, conversions: 22 }
      ]
    },
    {
      id: '2',
      name: 'New Product Launch',
      platform: 'whatsapp',
      status: 'completed',
      metrics: {
        reach: 5632,
        impressions: 8901,
        clicks: 1247,
        conversions: 89,
        revenue: 12340,
        engagement_rate: 18.3,
        ctr: 14.0,
        roas: 3.8
      },
      timeline: [
        { date: '2024-01-01', reach: 890, clicks: 156, conversions: 14 },
        { date: '2024-01-02', reach: 1023, clicks: 189, conversions: 21 },
        { date: '2024-01-03', reach: 1156, clicks: 203, conversions: 18 }
      ]
    }
  ]

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    reach: acc.reach + campaign.metrics.reach,
    clicks: acc.clicks + campaign.metrics.clicks,
    conversions: acc.conversions + campaign.metrics.conversions,
    revenue: acc.revenue + campaign.metrics.revenue
  }), { reach: 0, clicks: 0, conversions: 0, revenue: 0 })

  const platformColors = {
    whatsapp: 'text-green-600 bg-green-50 border-green-200',
    all: 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'emerald',
    format = 'number' 
  }: {
    title: string
    value: number
    change: number
    icon: any
    color?: string
    format?: 'number' | 'currency' | 'percentage'
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') return `R${val.toLocaleString()}`
      if (format === 'percentage') return `${val}%`
      return val.toLocaleString()
    }

    const isPositive = change >= 0

    return (
      <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600 mt-2`}>
              {formatValue(value)}
            </p>
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% vs last period
            </div>
          </div>
          <div className={`p-3 rounded-[9px] bg-${color}-50`}>
            <Icon className={`w-8 h-8 text-${color}-600`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            Campaign Analytics
          </h2>
          <p className="text-gray-600 mt-1">Track your viral success in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reach"
          value={totalMetrics.reach}
          change={23.5}
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Total Clicks"
          value={totalMetrics.clicks}
          change={18.2}
          icon={MousePointer}
          color="blue"
        />
        <MetricCard
          title="Conversions"
          value={totalMetrics.conversions}
          change={31.7}
          icon={ShoppingCart}
          color="purple"
        />
        <MetricCard
          title="Revenue"
          value={totalMetrics.revenue}
          change={42.1}
          icon={DollarSign}
          color="green"
          format="currency"
        />
      </div>

      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Campaign Performance */}
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Campaign Performance
          </h3>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-100 rounded-[9px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-[9px] border ${
                        platformColors[campaign.platform as keyof typeof platformColors]
                      }`}>
                        {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-[9px] ${
                        campaign.status === 'active' 
                          ? 'text-green-700 bg-green-100' 
                          : campaign.status === 'completed'
                          ? 'text-blue-700 bg-blue-100'
                          : 'text-yellow-700 bg-yellow-100'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      R{campaign.metrics.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {campaign.metrics.conversions} conversions
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {campaign.metrics.reach.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Reach</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {campaign.metrics.engagement_rate}%
                    </p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {campaign.metrics.roas}x
                    </p>
                    <p className="text-xs text-gray-500">ROAS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Top Performing Content
          </h3>
          <div className="space-y-4">
            {[
              { 
                title: 'Summer Sale - 50% Off Everything!',
                platform: 'WhatsApp',
                engagement: 94,
                conversions: 67,
                revenue: 8450
              },
              {
                title: 'New Arrival: Premium Collection',
                platform: 'WhatsApp',
                engagement: 87,
                conversions: 43,
                revenue: 5230
              },
              {
                title: 'Behind the Scenes: Our Process',
                platform: 'WhatsApp',
                engagement: 82,
                conversions: 28,
                revenue: 3120
              }
            ].map((content, index) => (
              <div key={index} className="border border-gray-100 rounded-[9px] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{content.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{content.platform}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        {content.engagement}%
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 text-emerald-500" />
                        {content.conversions}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      R{content.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            Real-time Activity
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Live Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Live Metrics</h4>
            {[
              { label: 'Active Viewers', value: '127', change: '+12' },
              { label: 'Messages Sent', value: '1,847', change: '+89' },
              { label: 'Clicks/min', value: '23', change: '+5' },
              { label: 'Conversions/hr', value: '8', change: '+2' }
            ].map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-[9px]">
                <span className="text-sm text-gray-600">{metric.label}</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{metric.value}</span>
                  <span className="text-xs text-green-600 ml-2">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { action: 'New conversion', platform: 'WhatsApp', time: '2 min ago', amount: 'R450' },
                  { action: 'Message opened', platform: 'WhatsApp', time: '3 min ago', amount: null },
                  { action: 'Link clicked', platform: 'WhatsApp', time: '5 min ago', amount: null },
                { action: 'New conversion', platform: 'WhatsApp', time: '7 min ago', amount: 'R280' },
                  { action: 'Story viewed', platform: 'WhatsApp Status', time: '9 min ago', amount: null },
                  { action: 'Broadcast shared', platform: 'WhatsApp', time: '12 min ago', amount: null }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-[9px]">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.platform} • {activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-emerald-600">{activity.amount}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Quick Actions</h4>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px]">
                <Zap className="w-4 h-4 mr-2" />
                Boost Top Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-[9px]">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-[9px]">
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-[9px]">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-[9px] border border-emerald-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          AI Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎯 Optimization Opportunities</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                <span>WhatsApp campaigns perform 34% better at 9 AM - consider rescheduling</span>
              </li>
              <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
              <span>Adding emojis to WhatsApp messages increases engagement by 28%</span>
              </li>
              <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
              <span>WhatsApp Status posts with product links convert 45% more</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">📈 Growth Predictions</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <span>Expected 67% revenue increase with current trend</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                <span>Audience growth rate: +23% month-over-month</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                <span>Peak season approaching - prepare for 3x traffic</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingAnalytics
