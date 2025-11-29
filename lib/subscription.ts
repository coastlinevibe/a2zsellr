import { supabase } from './supabaseClient'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '3 gallery images',
      '5 products in shop',
      'Basic contact information',
      'Customer reviews'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149,
    interval: 'month',
    features: [
      'Everything in Free',
      'Unlimited gallery images',
      'Gallery slider showcase',
      'Unlimited products',
      'WhatsApp marketing tools',
      'Advanced outreach automations',
      'Premium directory placement'
    ],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    interval: 'month',
    features: [
      'Everything in Premium',
      '12 gallery images (limited)',
      'Multi-location management',
      'Advanced analytics dashboard',
      'Priority WhatsApp broadcast windows',
      'Custom branding options',
      'Priority support',
      'Business marketing listing'
    ]
  }
]

export const TIER_PRICING = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 149, yearly: 1192 },
  business: { monthly: 299, yearly: 2392 }
}


export async function getUserSubscription(userId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) {
      throw new Error('No user ID provided')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, early_adopter, trial_end_date')
      .eq('id', targetUserId)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

export async function updateUserSubscription(
  userId: string, 
  tier: 'free' | 'premium' | 'business',
  status: string = 'active'
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }
}

export function getPlanFeatures(planId: string): string[] {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
  return plan?.features || []
}

export function getPlanPrice(planId: string, billing: 'monthly' | 'yearly' = 'monthly'): number {
  const pricing = TIER_PRICING[planId as keyof typeof TIER_PRICING]
  return pricing?.[billing] || 0
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0
  }).format(price)
}
