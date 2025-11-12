'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { MessageCircle, Clock, Zap, Crown, Star, Send, Phone, Mail, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  subscription_tier: 'free' | 'premium' | 'business'
  display_name: string
  email: string
}

export default function SupportPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, subscription_tier, display_name, email')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSupportLevel = () => {
    if (!profile) return 'guest'
    return profile.subscription_tier
  }

  const getSupportInfo = () => {
    const tier = getSupportLevel()
    
    switch (tier) {
      case 'business':
        return {
          title: '24/7 Premium Support',
          description: 'Priority support with dedicated account manager',
          responseTime: 'Within 1 hour',
          features: [
            'Phone support available',
            'Live chat priority queue',
            'Dedicated account manager',
            'Video call support',
            'Custom integrations help'
          ],
          color: 'from-purple-400 to-pink-500',
          icon: Crown,
          badge: 'BUSINESS'
        }
      case 'premium':
        return {
          title: 'Priority Support',
          description: 'Enhanced support with faster response times',
          responseTime: 'Within 4 hours',
          features: [
            'Email support priority',
            'Live chat access',
            'Feature request priority',
            'Setup assistance',
            'Marketing guidance'
          ],
          color: 'from-amber-400 to-orange-500',
          icon: Star,
          badge: 'PREMIUM'
        }
      case 'free':
        return {
          title: 'Community Support',
          description: 'Basic support through our help center and community',
          responseTime: 'Within 24-48 hours',
          features: [
            'Help center access',
            'Community forum',
            'Email support (limited)',
            'Basic troubleshooting',
            'FAQ resources'
          ],
          color: 'from-gray-400 to-gray-600',
          icon: HelpCircle,
          badge: 'FREE'
        }
      default:
        return {
          title: 'Guest Support',
          description: 'Limited support for non-registered users',
          responseTime: 'Within 48-72 hours',
          features: [
            'Help center access',
            'General inquiries only',
            'Account creation help'
          ],
          color: 'from-gray-300 to-gray-500',
          icon: MessageCircle,
          badge: 'GUEST'
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setIsSubmitting(true)
    
    try {
      // Here you would typically send the support request to your backend
      // For now, we'll just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Support request submitted successfully! We\'ll get back to you soon.')
      setSubject('')
      setMessage('')
    } catch (error) {
      alert('Failed to submit support request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const supportInfo = getSupportInfo()
  const IconComponent = supportInfo.icon

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${supportInfo.color} p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl border-2 border-black">
                <IconComponent className="w-8 h-8 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-white">{supportInfo.title}</h1>
                  <span className="bg-black text-white px-3 py-1 rounded-lg font-black text-sm">
                    {supportInfo.badge}
                  </span>
                </div>
                <p className="text-white font-bold">{supportInfo.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white px-4 py-2 rounded-lg border-2 border-black">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" />
                  <span className="font-black text-black">{supportInfo.responseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Features */}
          <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6">
            <h2 className="text-2xl font-black text-black mb-6">Your Support Benefits</h2>
            <div className="space-y-4">
              {supportInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-green-500 p-1 rounded-full border-2 border-black">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-bold text-black">{feature}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Prompt for Free Users */}
            {profile?.subscription_tier === 'free' && (
              <div className="mt-6 p-4 bg-yellow-100 rounded-xl border-2 border-black">
                <h3 className="font-black text-black mb-2">Want Better Support?</h3>
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Upgrade to Premium or Business for faster response times and priority support!
                </p>
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6">
            <h2 className="text-2xl font-black text-black mb-6">Contact Support</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-black text-black mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What can we help you with?"
                  className="w-full p-3 border-2 border-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-black mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  className="w-full p-3 border-2 border-black rounded-lg font-bold resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </form>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t-2 border-black">
              <h3 className="font-black text-black mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-black">support@a2zsellr.life</span>
                </div>
                {(profile?.subscription_tier === 'business') && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-black">+27 11 123 4567</span>
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-black">
                      BUSINESS ONLY
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] p-6">
          <h2 className="text-2xl font-black text-black mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black text-black mb-2">How do I upgrade my account?</h3>
              <p className="text-gray-700 font-bold">
                Go to your dashboard and click the "Upgrade" button to choose a premium plan.
              </p>
            </div>
            <div>
              <h3 className="font-black text-black mb-2">How do I add products to my shop?</h3>
              <p className="text-gray-700 font-bold">
                Navigate to your dashboard and use the "Products" tab to add and manage your inventory.
              </p>
            </div>
            <div>
              <h3 className="font-black text-black mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-700 font-bold">
                Yes, you can cancel anytime from your account settings. Your features remain active until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-black text-black mb-2">How do I reset my password?</h3>
              <p className="text-gray-700 font-bold">
                Use the "Forgot Password" link on the login page to receive a password reset email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
