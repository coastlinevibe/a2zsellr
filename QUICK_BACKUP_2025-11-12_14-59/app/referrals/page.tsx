'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Copy, Gift, Users, TrendingUp, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function ReferralsPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0
  })
  const [referralCode, setReferralCode] = useState('')
  const [recentReferrals, setRecentReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const referralLink = referralCode ? `https://www.a2zsellr.life/auth/signup-animated?ref=${referralCode}` : ''

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Fetch user's referral data
  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code)
      }

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:profiles!referrals_referred_user_id_fkey(display_name, email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

      if (referrals) {
        const totalReferrals = referrals.length
        const successfulReferrals = referrals.filter((r: any) => r.status === 'completed').length
        const pendingReferrals = referrals.filter((r: any) => r.status === 'pending').length
        const totalEarnings = referrals.reduce((sum: number, r: any) => sum + (r.earnings_cents || 0), 0)

        setReferralStats({
          totalReferrals,
          successfulReferrals,
          pendingReferrals,
          totalEarnings
        })

        // Format recent referrals for display
        const formattedReferrals = referrals.slice(0, 3).map((referral: any) => ({
          email: referral.referred_user?.email || 'Unknown',
          status: referral.status,
          date: new Date(referral.created_at).toLocaleDateString()
        }))

        setRecentReferrals(formattedReferrals)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view referrals</h1>
          <p className="text-gray-600">You need to be logged in to access your referral dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back to Dashboard Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-black font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </motion.div>

          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 border-2 border-green-500 rounded-full mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Gift className="w-8 h-8 text-green-600" />
          </motion.div>
          <h1 className="text-4xl font-black text-black mb-4">
            REFER & EARN
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your referral link and earn rewards when friends join A2Z Sellr
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Referral Link Card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="mb-6">
                <h2 className="flex items-center gap-3 text-2xl font-black text-black mb-2">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                  Your Referral Link
                </h2>
                <p className="text-gray-600">
                  Share this link with friends and earn R50 for each successful signup
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-white border-2 border-black rounded-lg p-4 font-mono text-sm break-all">
                  {referralLink}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>

                  <Button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join A2Z Sellr and start selling online! Sign up here: ${referralLink}`)}`, '_blank')}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-black border-2 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]"
                  >
                    Share on WhatsApp
                  </Button>
                </div>

                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">How it works:</h3>
                  <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                    <li>Share your referral link with friends</li>
                    <li>When they sign up and complete their profile, you earn R50</li>
                    <li>Get paid out monthly</li>
                    <li>Track all your referrals and earnings here</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Total Referrals */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-black">
                    {loading ? '...' : referralStats.totalReferrals}
                  </p>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                </div>
              </div>
            </div>

            {/* Successful Referrals */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 border-2 border-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-black">
                    {loading ? '...' : referralStats.successfulReferrals}
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 border-2 border-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-black">
                    {loading ? '...' : `R${(referralStats.totalEarnings / 100).toFixed(2)}`}
                  </p>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
              </div>
            </div>

            {/* Pending Referrals */}
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 border-2 border-yellow-500 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-2xl font-black text-black">
                    {loading ? '...' : referralStats.pendingReferrals}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Referrals Table */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-black mb-2">Recent Referrals</h2>
              <p className="text-gray-600">Track the status of people you've referred</p>
            </div>
            <div className="space-y-4">
              {loading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                ))
              ) : recentReferrals.length > 0 ? (
                recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        referral.status === 'completed' ? 'bg-green-100' :
                        referral.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {referral.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : referral.status === 'pending' ? (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        ) : (
                          <Users className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-black">{referral.email}</p>
                        <p className="text-sm text-gray-600">Referred {referral.date}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      referral.status === 'completed' ? 'bg-green-100 text-green-800 border-green-500' :
                      referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-500' :
                      'bg-blue-100 text-blue-800 border-blue-500'
                    }`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No referrals yet</p>
                  <p className="text-sm text-gray-400 mt-1">Share your referral link to start earning!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
