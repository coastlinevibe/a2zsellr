'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { AnimatedForm, AnimatedInput, AnimatedButton } from '@/components/ui/AnimatedForm'
import { Home, Crown, Users, Check, Star, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { formatPrice, TIER_PRICING } from '@/lib/subscription'

export default function AnimatedSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [displayNameAvailable, setDisplayNameAvailable] = useState<boolean | null>(null)
  const [displayNameError, setDisplayNameError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; title: string; description?: string } | null>(null)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get selected plan from URL params
  const selectedPlan = searchParams?.get('plan') || 'free'

  useEffect(() => {
    if (user) {
      // Create username handle from email (e.g., @alfbear)
      const userHandle = '@' + (user.email?.split('@')[0] || 'user')
      
      // Redirect to profile page
      router.push('/profile')
    }
  }, [user, router, selectedPlan])

  useEffect(() => {
    if (!notification) return

    const timeout = setTimeout(() => {
      setNotification(null)
    }, notification.type === 'success' ? 8000 : 6000)

    return () => clearTimeout(timeout)
  }, [notification])

  // Debounced display name availability check
  useEffect(() => {
    if (!displayName.trim()) {
      setDisplayNameAvailable(null)
      setDisplayNameError('')
      return
    }

    if (displayName.length < 3) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Display name must be at least 3 characters')
      return
    }

    if (displayName.length > 30) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Display name must be less than 30 characters')
      return
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(displayName)) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Only letters, numbers, spaces, hyphens, and underscores allowed')
      return
    }

    const timeoutId = setTimeout(() => {
      checkDisplayNameAvailability(displayName.trim())
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [displayName])

  const handleDisplayNameChange = (value: string) => {
    setDisplayNameError('')
    setDisplayNameAvailable(null)
  }

  const checkDisplayNameAvailability = async (name: string) => {
    setCheckingAvailability(true)
    setDisplayNameError('')

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', name)
        .maybeSingle()

      if (error) {
        console.error('Error checking display name:', error)
        setDisplayNameError('Error checking availability')
        setDisplayNameAvailable(null)
        return
      }

      if (data) {
        setDisplayNameAvailable(false)
        setDisplayNameError('This display name is already taken')
      } else {
        setDisplayNameAvailable(true)
        setDisplayNameError('')
      }
    } catch (error) {
      console.error('Error checking display name availability:', error)
      setDisplayNameError('Error checking availability')
      setDisplayNameAvailable(null)
    } finally {
      setCheckingAvailability(false)
    }
  }

  // Plan configuration
  const getPlanConfig = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: Crown,
          color: 'emerald',
          price: TIER_PRICING.premium.monthly,
          originalPrice: TIER_PRICING.premium.monthly,
          features: [
            '✨ Everything in Free Plan',
            '🚀 Premium Directory Placement',
            '🎨 Gallery Slider Showcase',
            '🛒 Advanced Shop Integration',
            '📱 WhatsApp Ad Scheduling',
            '📘 Facebook Campaign Tools',
            '📊 Enhanced Analytics',
            '🎯 Premium Marketing Listing'
          ],
          discount: null
        }
      case 'business':
        return {
          name: 'Business',
          icon: Users,
          color: 'blue',
          price: TIER_PRICING.business.monthly,
          originalPrice: TIER_PRICING.business.monthly,
          features: [
            '💎 Everything in Premium Plan',
            '🏪 Multi-Location Management',
            '📈 Advanced Analytics Dashboard',
            '📷 Instagram Ad Automation',
            '🎨 Custom Business Branding',
            '🏆 Priority Customer Support',
            '🚀 Business Marketing Listing',
            '📊 Performance Insights'
          ],
          discount: null
        }
      default:
        return {
          name: 'Free',
          icon: Check,
          color: 'emerald',
          price: 0,
          originalPrice: 0,
          features: [
            '🏢 Professional Business Listing',
            '🛍️ Complete Online Shop (5 Products)',
            '🎯 Powerful Marketing Tools',
            '📱 Complete Contact Information',
            '📸 Business Gallery (3 Images)',
            '⭐ Customer Reviews & Ratings',
            '📧 Direct Customer Contact'
          ],
          discount: null
        }
    }
  }

  const planConfig = getPlanConfig(selectedPlan)

  const NotificationAlert = () => {
    if (!notification) return null

    const base = 'mb-6 rounded-xl px-4 py-3 border text-left'
    const variants = {
      success: 'bg-emerald-500/10 border-emerald-400 text-emerald-100',
      error: 'bg-red-500/10 border-red-500 text-red-100',
      info: 'bg-blue-500/10 border-blue-400 text-blue-100',
    } as const

    const Icon = notification.type === 'success' ? CheckCircle2 : notification.type === 'error' ? AlertTriangle : Info

    return (
      <div className={`${base} ${variants[notification.type]}`} role={notification.type === 'error' ? 'alert' : 'status'}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold leading-tight">{notification.title}</p>
            {notification.description && (
              <p className="text-sm mt-1 opacity-90 leading-snug">{notification.description}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotification(null)

    // Check display name availability
    if (!displayName.trim()) {
      setError('Display name is required')
      setNotification({
        type: 'error',
        title: 'Display name required',
        description: 'Please enter a display name.',
      })
      setLoading(false)
      return
    }

    if (displayNameAvailable !== true) {
      setError('Display name is not available')
      setNotification({
        type: 'error',
        title: 'Display name unavailable',
        description: 'Please choose a different display name.',
      })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setNotification({
        type: 'error',
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setNotification({
        type: 'error',
        title: 'Passwords do not match',
        description: 'Make sure your password and confirmation are identical.',
      })
      setLoading(false)
      return
    }

    setNotification({
      type: 'info',
      title: 'Submitting registration…',
      description: 'Hang tight while we create your account.',
    })

    const { error } = await signUp(email, password, { 
      display_name: displayName.trim(),
      selected_plan: selectedPlan
    })
    
    if (error) {
      setError(error.message)
      setNotification({
        type: 'error',
        title: 'Registration failed',
        description: error.message,
      })
    } else {
      setSuccess(true)
      setNotification({
        type: 'success',
        title: 'Registration done!',
        description: `Email confirmation link sent to ${email}. Please verify to finish setting up your account.`,
      })
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, #00000015 25%, transparent 25%), linear-gradient(-45deg, #00000015 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000015 75%), linear-gradient(-45deg, transparent 75%, #00000015 75%)",
            backgroundSize: "30px 30px",
            backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px"
          }} />
        </div>
        
        {/* Home Link */}
        <Link href="/" className="absolute top-6 left-6 z-20 bg-white border-2 border-black rounded-lg px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-black font-black">
          <Home className="h-5 w-5" />
          <span>HOME</span>
        </Link>
        
        <div className="relative z-10 w-full px-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-8 text-center transform rotate-1">
            <NotificationAlert />
            
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-6 transform -rotate-1">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-black uppercase mb-2">CHECK YOUR EMAIL!</h2>
              <p className="text-sm font-bold">REGISTRATION ALMOST COMPLETE!</p>
            </div>
            
            <div className="bg-yellow-300 p-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] mb-6">
              <p className="text-black font-bold text-sm mb-2">
                📧 CONFIRMATION LINK SENT TO:
              </p>
              <p className="text-black font-black text-lg break-all">
                {email}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-black font-bold text-sm mb-4">
                ALREADY CONFIRMED?
              </p>
              <Link 
                href="/auth/login-animated" 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block"
              >
                SIGN IN HERE
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(45deg, #00000015 25%, transparent 25%), linear-gradient(-45deg, #00000015 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000015 75%), linear-gradient(-45deg, transparent 75%, #00000015 75%)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px"
        }} />
      </div>
      
      {/* Home Link */}
      <Link href="/" className="absolute top-6 left-6 z-20 bg-white border-2 border-black rounded-lg px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-black font-black">
        <Home className="h-5 w-5" />
        <span>HOME</span>
      </Link>
      
      <div className="relative z-10 w-full px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-8 transform -rotate-1">
          <NotificationAlert />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-4 transform rotate-1">
              <h1 className="text-3xl font-black uppercase">REGISTER</h1>
              <p className="text-sm font-bold mt-1">JOIN THE A2Z SELLR COMMUNITY!</p>
            </div>
            <p className="text-black font-bold text-sm bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
              🚀 JOIN 10,000+ SELLERS GROWING WITH A2Z SELLR 🚀
            </p>
          </div>

          {/* Plan Confirmation */}
          <div className={`mb-6 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${
            planConfig.color === 'emerald' ? 'bg-green-400' :
            planConfig.color === 'blue' ? 'bg-blue-400' :
            'bg-gray-400'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-lg border-2 border-black">
                  <planConfig.icon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-black font-black text-sm uppercase">
                    {planConfig.name} PLAN
                  </div>
                  <div className="text-black font-bold text-xs">
                    SELECTED FOR REGISTRATION
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border-2 border-black">
                {planConfig.price > 0 ? (
                  <div className="text-black font-black text-sm">
                    {formatPrice(planConfig.price)}/MO
                  </div>
                ) : (
                  <div className="text-black font-black text-sm">FREE</div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border-2 border-black mb-3">
              <div className="space-y-2">
                {planConfig.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-black">
                    <div className="bg-green-500 p-1 rounded border border-black">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold">{feature}</span>
                  </div>
                ))}
                {planConfig.features.length > 3 && (
                  <div className="text-xs text-black font-bold bg-yellow-300 p-2 rounded border border-black text-center">
                    +{planConfig.features.length - 3} MORE AMAZING FEATURES!
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/choose-plan" 
                className="bg-white text-black px-4 py-2 rounded-lg border-2 border-black font-black text-xs hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block"
              >
                CHANGE PLAN?
              </Link>
            </div>
          </div>


          {/* Value Proposition */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transform rotate-1">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-black fill-current" />
                <Star className="w-5 h-5 text-black fill-current" />
                <Star className="w-5 h-5 text-black fill-current" />
                <Star className="w-5 h-5 text-black fill-current" />
                <Star className="w-5 h-5 text-black fill-current" />
              </div>
              <p className="text-black text-sm font-black mb-1 uppercase">
                "A2Z HELPED US REACH 300% MORE CUSTOMERS!"
              </p>
              <p className="text-black text-xs font-bold">
                JOIN 10,000+ SELLERS ALREADY GROWING!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AnimatedInput
              label="Display Name - Check Availability"
              type="text"
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDisplayName(e.target.value)
                handleDisplayNameChange(e.target.value)
              }}
              required
              className={`${
                displayNameAvailable === true ? 'border-green-500 focus:border-green-500' :
                displayNameAvailable === false ? 'border-red-500 focus:border-red-500' :
                ''
              }`}
            />
            
            {/* Availability Status */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {checkingAvailability && (
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              )}
              {displayNameAvailable === true && (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Available</span>
                </div>
              )}
              {displayNameAvailable === false && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Taken</span>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {displayNameError && (
              <div className="mt-1 text-red-400 text-xs">
                {displayNameError}
              </div>
            )}
            
            {/* Success Message */}
            {displayNameAvailable === true && displayName.length > 0 && (
              <div className="mt-1 text-green-400 text-xs">
                "{displayName}" is available!
              </div>
            )}
          </div>

          <AnimatedInput
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />

          <AnimatedInput
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />

          <AnimatedInput
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
          />

          {error && !notification && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-2">
              {error}
            </div>
          )}

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Submit'}
          </AnimatedButton>

            <div className="text-center mt-6">
              <p className="text-black font-bold text-sm">
                ALREADY HAVE AN ACCOUNT?{' '}
                <Link 
                  href={`/auth/login-animated${selectedPlan ? `?plan=${selectedPlan}` : ''}`} 
                  className="bg-blue-500 text-white px-3 py-1 rounded border-2 border-black font-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block ml-2"
                >
                  SIGN IN
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
