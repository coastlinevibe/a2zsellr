'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { AnimatedForm, AnimatedInput, AnimatedPasswordInput, AnimatedButton } from '@/components/ui/AnimatedForm'
import { PaymentModal } from '@/components/PaymentModal'
import { Home, Crown, Users, Check, Star, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { motion } from 'framer-motion'
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
  const [paymentEnabled, setPaymentEnabled] = useState(true)
  const [sandboxMode, setSandboxMode] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get selected plan from URL params
  const selectedPlan = searchParams?.get('plan') || 'free'
  const referralParam = searchParams?.get('ref')

  // Store referral code persistently during signup process
  useEffect(() => {
    if (referralParam) {
      // Store referral code in sessionStorage so it persists across plan changes
      sessionStorage.setItem('signup_referral_code', referralParam)
    }
  }, [referralParam])

  // Get referral code from URL or stored session
  const referralCode = referralParam || sessionStorage.getItem('signup_referral_code')

  useEffect(() => {
    if (user && !success && !justRegistered && !loading) {
      // Only redirect if user exists, we're not in success state, and user didn't just register
      // This prevents automatic redirect after registration
      const userHandle = '@' + (user.email?.split('@')[0] || 'user')
      
      // Redirect to profile page
      router.push('/profile')
    }
  }, [user, router, selectedPlan, success, justRegistered, loading])

  // Check payment settings on component mount
  useEffect(() => {
    checkPaymentSettings()
  }, [])

  const checkPaymentSettings = async () => {
    try {
      // Fetch both payment_enabled and sandbox_mode settings
      const { data: paymentSetting, error: paymentError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'payment_enabled')
        .single()

      const { data: sandboxSetting, error: sandboxError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'sandbox_mode')
        .single()

      if (paymentError) {
        // If no settings table exists, default to enabled (fallback)
        console.log('No payment settings found, defaulting to enabled')
        setPaymentEnabled(true)
      } else {
        const isEnabled = paymentSetting.value === 'true' || paymentSetting.value === true
        console.log('Payment setting loaded:', paymentSetting.value, '-> enabled:', isEnabled)
        setPaymentEnabled(isEnabled)
      }

      if (sandboxError) {
        console.log('No sandbox settings found, defaulting to disabled')
        setSandboxMode(false)
      } else {
        const isSandbox = sandboxSetting.value === 'true' || sandboxSetting.value === true
        console.log('Sandbox setting loaded:', sandboxSetting.value, '-> sandbox:', isSandbox)
        setSandboxMode(isSandbox)
      }
    } catch (error) {
      console.error('Error checking payment settings:', error)
      // Default to enabled payments, disabled sandbox if there's an error
      setPaymentEnabled(true)
      setSandboxMode(false)
    }
  }

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
      success: 'bg-emerald-500/10 border-emerald-400 text-emerald-900',
      error: 'bg-red-600 border-red-600 text-white',
      info: 'bg-blue-500/10 border-blue-400 text-blue-900',
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

    const { error, data } = await signUp(email, password, { 
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
      // Get the user ID from the signup response
      const userId = data?.user?.id
      
      // Generate referral code and handle referral tracking
      try {
        // Generate unique referral code for new user
        const newUserReferralCode = `${displayName.trim().toLowerCase().replace(/\s+/g, '')}_${Math.random().toString(36).substring(2, 8)}`
        
        // Update profile with referral code
        await supabase
          .from('profiles')
          .update({ referral_code: newUserReferralCode })
          .eq('display_name', displayName.trim())
        
        // Handle referral tracking if referral code was provided
        if (referralCode && userId) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode)
            .single()
          
          if (referrer) {
            // Create referral record with referred_user_id
            await supabase
              .from('referrals')
              .insert({
                referrer_id: referrer.id,
                referred_user_id: userId,
                referral_code: referralCode,
                status: 'pending'
              })
          }
        }
      } catch (referralError) {
        console.error('Error setting up referral:', referralError)
        // Don't fail registration for referral errors
      }
      
      // Clear stored referral code after successful registration
      sessionStorage.removeItem('signup_referral_code')
      
      // Set flags to prevent auto-redirect and show success page
      setJustRegistered(true)
      setSuccess(true)
      
      console.log('Registration successful, payment settings:', { paymentEnabled, sandboxMode, selectedPlan })
      
      // For premium/business plans with payments enabled, show payment modal immediately
      if (selectedPlan !== 'free' && paymentEnabled && !sandboxMode) {
        setNotification({
          type: 'success',
          title: 'Account created! Complete payment to activate.',
          description: `Registration successful! Now complete your ${selectedPlan} subscription payment to activate your account.`,
        })
        // Show payment modal immediately for premium/business plans
        setTimeout(() => setShowPaymentModal(true), 1000)
      } else {
        setNotification({
          type: 'success',
          title: 'Registration complete!',
          description: selectedPlan !== 'free' && (sandboxMode || !paymentEnabled)
            ? `Your ${selectedPlan} account has been created and is ready to use! (${sandboxMode ? 'sandbox mode enabled' : 'payments currently disabled'})`
            : `Your account has been created successfully! You can now sign in and start using A2Z Sellr.`,
        })
      }
    }
    
    setLoading(false)
  }

  console.log('Render state:', { success, user, justRegistered, selectedPlan, paymentEnabled, sandboxMode })
  
  if (success) {
    console.log('Showing success page!')
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
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-black font-black"
          style={{
            background: '#5cbdfd',
            fontFamily: 'inherit',
            padding: '0.6em 1.3em',
            fontWeight: 900,
            fontSize: '18px',
            border: '3px solid black',
            borderRadius: '0.4em',
            boxShadow: '0.1em 0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
            e.currentTarget.style.boxShadow = '0.15em 0.15em';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '0.1em 0.1em';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
            e.currentTarget.style.boxShadow = '0.05em 0.05em';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
            e.currentTarget.style.boxShadow = '0.15em 0.15em';
          }}
        >
          <Home className="h-5 w-5" />
          <span>HOME</span>
        </Link>
        
        <div className="relative z-10 w-full px-4 flex items-center justify-center">
          <motion.div 
            className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-8 text-center transform rotate-1"
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <NotificationAlert />
            
            {/* Success Header */}
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-6 transform -rotate-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="text-4xl mb-2">{selectedPlan !== 'free' && paymentEnabled && !sandboxMode ? '💳' : '🎉'}</div>
              <h2 className="text-2xl font-black uppercase mb-2">ACCOUNT CREATED!</h2>
              <p className="text-sm font-bold">
                {selectedPlan !== 'free' && paymentEnabled && !sandboxMode
                  ? 'PAYMENT REQUIRED TO ACTIVATE' 
                  : selectedPlan !== 'free' && (sandboxMode || !paymentEnabled)
                  ? 'ACCOUNT READY TO USE'
                  : 'REGISTRATION COMPLETE!'
                }
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-yellow-300 p-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-black font-bold text-sm mb-2">
                📧 ACCOUNT CREATED FOR:
              </p>
              <p className="text-black font-black text-lg break-all">
                {email}
              </p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {selectedPlan !== 'free' && paymentEnabled && !sandboxMode ? (
                <>
                  <p className="text-black font-bold text-sm mb-4">
                    PAYMENT REQUIRED TO ACTIVATE YOUR {selectedPlan.toUpperCase()} ACCOUNT
                  </p>
                  <div className="bg-yellow-100 p-3 rounded-lg border-2 border-black mb-4">
                    <p className="text-black font-bold text-xs">
                      ⚠️ Your account is created but not active yet. Complete payment to access your profile and premium features.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block w-full"
                    >
                      PAY NOW TO ACTIVATE
                    </button>
                    <Link 
                      href="/auth/login-animated" 
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg border-2 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block text-sm"
                    >
                      SIGN IN LATER
                    </Link>
                  </div>
                </>
              ) : selectedPlan !== 'free' && (sandboxMode || !paymentEnabled) ? (
                <>
                  <p className="text-black font-bold text-sm mb-4">
                    YOUR {selectedPlan.toUpperCase()} ACCOUNT IS READY!
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-100 p-3 rounded-lg border-2 border-black mb-3">
                      <p className="text-black font-bold text-sm">
                        🎉 No payment required - {sandboxMode ? 'sandbox mode is enabled for testing' : 'payments are currently disabled by admin'}
                      </p>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block w-full"
                    >
                      GO TO DASHBOARD
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-black font-bold text-sm mb-4">
                    READY TO START SELLING?
                  </p>
                  <Link 
                    href="/auth/login-animated" 
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg border-2 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all inline-block"
                  >
                    SIGN IN HERE
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Payment Modal */}
        {selectedPlan !== 'free' && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            selectedTier={selectedPlan as 'premium' | 'business'}
            billingCycle="monthly"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300 py-4 md:py-12 px-2 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(45deg, #00000015 25%, transparent 25%), linear-gradient(-45deg, #00000015 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #00000015 75%), linear-gradient(-45deg, transparent 75%, #00000015 75%)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 0 15px, 15px -15px, -15px 0px"
        }} />
      </div>
      
      {/* Home Link */}
      <Link href="/" className="absolute top-2 left-2 md:top-6 md:left-6 z-20 bg-white border-2 border-black rounded-lg px-2 py-1 md:px-4 md:py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-1 md:gap-2 text-black font-black text-sm md:text-base">
        <Home className="h-4 w-4 md:h-5 md:w-5" />
        <span className="hidden sm:inline">HOME</span>
      </Link>
      
      <div className="relative z-10 w-full px-2 sm:px-4 flex items-center justify-center min-h-screen pt-12 md:pt-0">
        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] p-4 md:p-8 transform -rotate-1"
          initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: -1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <NotificationAlert />
          
          {/* Header */}
          <div className="text-center mb-4 md:mb-8">
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 md:p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-3 md:mb-4 transform rotate-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-2xl md:text-3xl font-black uppercase">REGISTER</h1>
              <p className="text-xs md:text-sm font-bold mt-1">JOIN THE A2Z SELLR COMMUNITY!</p>
            </motion.div>

          </div>

          {/* Plan Confirmation */}
          <motion.div 
            className={`mb-4 md:mb-6 p-3 md:p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${
              planConfig.color === 'emerald' ? 'bg-green-400' :
              planConfig.color === 'blue' ? 'bg-blue-400' :
              'bg-gray-400'
            }`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="bg-white p-1.5 md:p-2 rounded-lg border-2 border-black flex-shrink-0">
                  <planConfig.icon className="w-4 h-4 md:w-5 md:h-5 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-black font-black text-xs md:text-sm uppercase truncate">
                    {planConfig.name} PLAN
                  </div>
                  <div className="text-black font-bold text-xs">
                    SELECTED FOR REGISTRATION
                  </div>
                </div>
              </div>
              <div className="bg-white px-2 md:px-3 py-1 rounded-lg border-2 border-black flex-shrink-0">
                {planConfig.price > 0 ? (
                  <div className="text-black font-black text-xs md:text-sm">
                    {formatPrice(planConfig.price)}/MO
                  </div>
                ) : (
                  <div className="text-black font-black text-xs md:text-sm">FREE</div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-2 md:p-3 rounded-lg border-2 border-black mb-3">
              <div className="space-y-1.5 md:space-y-2">
                {planConfig.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-black">
                    <div className="bg-green-500 p-0.5 md:p-1 rounded border border-black flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold leading-tight">{feature}</span>
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
                href="/#pricing"
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.5em 1em',
                  fontWeight: 900,
                  fontSize: '13px',
                  border: '3px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                  e.currentTarget.style.boxShadow = '0.05em 0.05em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
              >
                CHANGE PLAN?
              </Link>
            </div>
          </motion.div>




          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
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

          <AnimatedPasswordInput
            label="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />

          <AnimatedPasswordInput
            label="Confirm password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
          />

          {error && !notification && (
            <div className="text-white text-sm text-center bg-red-600 border border-red-600 rounded-lg p-2">
              {error}
            </div>
          )}

          <AnimatedButton 
            type="submit" 
            disabled={loading || !displayNameAvailable}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </AnimatedButton>

          <div className="text-center mt-6">
            <p className="text-black font-bold text-sm">
              ALREADY HAVE AN ACCOUNT?{' '}
              <Link 
                href={`/auth/login-animated${selectedPlan ? `?plan=${selectedPlan}` : ''}`} 
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.6em 1.3em',
                  fontWeight: 900,
                  fontSize: '15px',
                  border: '3px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block',
                  marginLeft: '0.5em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                  e.currentTarget.style.boxShadow = '0.05em 0.05em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
              >
                SIGN IN
              </Link>
            </p>
          </div>
        </motion.form>
        </motion.div>
      </div>
      
      {/* Payment Modal - Also available on main signup form for testing */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedPlan === 'business' ? 'business' : 'premium'}
        billingCycle="monthly"
      />
    </div>
  )
}
