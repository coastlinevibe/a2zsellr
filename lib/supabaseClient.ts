import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  business_category: string | null
  business_location: string | null
  business_hours: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: string | null
  verified_seller: boolean
  early_adopter: boolean
  is_active: boolean
  current_listings: number
  created_at: string
  updated_at: string
}
