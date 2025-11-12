'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Heart, MessageSquare, Share2, Users, Calendar, BarChart3, PieChart, Activity, Target, Clock, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  overview: {
    total_views: number
    total_engagement: number
    total_shares: number
    total_campaigns: number
    growth_rate: number
    best_performing_platform: string
  }
  platforms: {
    platform: string
    views: number
    engagement: number
    shares: number
    growth: number
    color: string
  }[]
  campaigns: {
    id: string
    name: string
    platform: string
    status: 'active' | 'completed' | 'paused'
    views: number
    engagement: number
    conversion_rate: number
    start_date: string
    end_date?: string
  }[]
  timeline: {
    date: string
    views: number
    engagement: number
    shares: number
  }[]
  demographics: {
    age_groups: { range: string; percentage: number }[]
    locations: { city: string; percentage: number }[]
    interests: { category: string; percentage: number }[]
  }
}

interface MarketingAnalyticsProps {
  userId: string
  dateRange: 'week' | 'month' | 'quarter' | 'year'
  onDateRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void
}

export function MarketingAnalytics({ userId, dateRange, onDateRangeChange }: MarketingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      total_views: 12450,
      total_engagement: 1890,
      total_shares: 456,
      total_campaigns: 8,
      growth_rate: 23.5,
      best_performing_platform: 'WhatsApp'
    },
    platforms: [
      {
        platform: 'WhatsApp',
        views: 5200,
        engagement: 890,
        shares: 234,
        growth: 28.3,
        color: 'bg-green-500'
      },
      {
        platform: 'Facebook',
        views: 4100,
        engagement: 567,
        shares: 156,
        growth: 15.7,
        color: 'bg-blue-600'
      },
      {
        platform: 'Instagram',
        views: 2150,
        engagement: 298,
        shares: 45,
        growth: 31.2,
        color: 'bg-pink-500'
      },
      {
        platform: 'Twitter',
        views: 1000,
        engagement: 135,
        shares: 21,
        growth: -5.2,
        color: 'bg-blue-400'
      }
    ],
    campaigns: [
      {
        id: '1',
        name: 'Summer Sale 2025',
        platform: 'WhatsApp',
        status: 'active',
        views: 2340,
        engagement: 345,
        conversion_rate: 12.5,
        start_date: '2025-11-01',
        end_date: '2025-11-30'
      },
      {
        id: '2',
        name: 'New Product Launch',
        platform: 'Facebook',
        status: 'completed',
        views: 1890,
        engagement: 234,
        conversion_rate: 8.7,
        start_date: '2025-10-15',
        end_date: '2025-10-31'
      },
      {
        id: '3',
        name: 'Weekly Specials',
        platform: 'Instagram',
        status: 'active',
        views: 1200,
        engagement: 189,
        conversion_rate: 15.2,
        start_date: '2025-11-01'
      }
    ],
    timeline: [
      { date: '2025-11-01', views: 450, engagement: 67, shares: 12 },
      { date: '2025-11-02', views: 520, engagement: 89, shares: 18 },
      { date: '2025-11-03', views: 380, engagement: 45, shares: 8 },
      { date: '2025-11-04', views: 670, engagement: 123, shares: 25 },
      { date: '2025-11-05', views: 590, engagement: 98, shares: 19 },
      { date: '2025-11-06', views: 720, engagement: 145, shares: 32 }
    ],
    demographics: {
      age_groups: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 28 },
        { range: '45-54', percentage: 15 },
        { range: '55+', percentage: 7 }
      ],
      locations: [
        { city: 'Johannesburg', percentage: 32 },
        { city: 'Cape Town', percentage: 28 },
        { city: 'Durban', percentage: 18 },
        { city: 'Pretoria', percentage: 12 },
        { city: 'Other', percentage: 10 }
      ],
      interests: [
        { category: 'Shopping', percentage: 45 },
        { category: 'Food & Dining', percentage: 32 },
        { category: 'Technology', percentage: 28 },
        { category: 'Health & Fitness', percentage: 22 },
        { category: 'Travel', percentage: 18 }
      ]
    }
  })

  const [loading, setLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'shares'>('views')

  useEffect(() => {
    // Simulate data fetching based on date range
    setLoading(true)
    setTimeout(() => {
      // In real implementation, fetch data from API based on userId and dateRange
      setLoading(false)
    }, 1000)
  }, [userId, dateRange])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Marketing Analytics
          </h2>
          <p className="text-gray-600">Track your marketing performance across all platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800">Premium Feature</Badge>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.total_views)}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm ${getGrowthColor(analytics.overview.growth_rate)}`}>
            <TrendingUp className="w-3 h-3" />
            +{analytics.overview.growth_rate}% vs last period
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.total_engagement)}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {((analytics.overview.total_engagement / analytics.overview.total_views) * 100).toFixed(1)}% engagement rate
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shares</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.total_shares)}</p>
            </div>
            <Share2 className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {((analytics.overview.total_shares / analytics.overview.total_views) * 100).toFixed(1)}% share rate
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_campaigns}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Best: {analytics.overview.best_performing_platform}
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
        <div className="space-y-4">
          {analytics.platforms.map((platform) => (
            <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{platform.platform}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(platform.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(platform.engagement)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {formatNumber(platform.shares)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getGrowthColor(platform.growth)}`}>
                  {platform.growth > 0 ? '+' : ''}{platform.growth.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">vs last period</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Timeline</h3>
          <div className="flex gap-2">
            {(['views', 'engagement', 'shares'] as const).map((metric) => (
              <Button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                variant={selectedMetric === metric ? 'default' : 'outline'}
                size="sm"
                className={selectedMetric === metric ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.timeline.map((point, index) => {
            const maxValue = Math.max(...analytics.timeline.map(p => p[selectedMetric]))
            const height = (point[selectedMetric] / maxValue) * 100
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-emerald-500 rounded-t transition-all duration-300 hover:bg-emerald-600"
                  style={{ height: `${height}%` }}
                  title={`${point.date}: ${point[selectedMetric]}`}
                ></div>
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-900">Campaign</th>
                <th className="text-left p-3 font-medium text-gray-900">Platform</th>
                <th className="text-left p-3 font-medium text-gray-900">Status</th>
                <th className="text-left p-3 font-medium text-gray-900">Views</th>
                <th className="text-left p-3 font-medium text-gray-900">Engagement</th>
                <th className="text-left p-3 font-medium text-gray-900">Conversion</th>
                <th className="text-left p-3 font-medium text-gray-900">Period</th>
              </tr>
            </thead>
            <tbody>
              {analytics.campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{campaign.name}</td>
                  <td className="p-3 text-gray-600">{campaign.platform}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-600">{formatNumber(campaign.views)}</td>
                  <td className="p-3 text-gray-600">{formatNumber(campaign.engagement)}</td>
                  <td className="p-3 text-gray-600">{campaign.conversion_rate}%</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {new Date(campaign.start_date).toLocaleDateString()} - {
                      campaign.end_date 
                        ? new Date(campaign.end_date).toLocaleDateString()
                        : 'Ongoing'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Groups */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Age Groups
          </h3>
          <div className="space-y-3">
            {analytics.demographics.age_groups.map((group) => (
              <div key={group.range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{group.range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Top Locations
          </h3>
          <div className="space-y-3">
            {analytics.demographics.locations.map((location) => (
              <div key={location.city} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{location.city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Top Interests
          </h3>
          <div className="space-y-3">
            {analytics.demographics.interests.map((interest) => (
              <div key={interest.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{interest.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${interest.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{interest.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export & Actions */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export & Actions</h3>
            <p className="text-gray-600">Download reports or schedule automated insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Export PDF
            </Button>
            <Button variant="outline">
              Export CSV
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Schedule Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
