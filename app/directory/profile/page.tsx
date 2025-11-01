'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'

export default function DirectoryProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirectToTierPage = async () => {
      if (loading) return
      
      if (!user) {
        router.push('/auth/login-animated')
        return
      }

      try {
        const subscription = await getUserSubscription()
        const tier = subscription?.subscription_tier || 'free'
        
        // Create username handle from email (e.g., @alfbear)
        const userHandle = '@' + (user.email?.split('@')[0] || 'user')
        
        // Get tab parameter if it exists
        const tab = searchParams?.get('tab')
        const tabParam = tab ? `?tab=${tab}` : ''
        
        // Redirect to tier-specific page with username handle and tab parameter
        switch (tier) {
          case 'premium':
            router.push(`/directory/${userHandle}/premium${tabParam}`)
            break
          case 'business':
            router.push(`/directory/${userHandle}/business${tabParam}`)
            break
          default:
            router.push(`/directory/${userHandle}/free${tabParam}`)
            break
        }
      } catch (error) {
        console.error('Error getting subscription:', error)
        // Default to free if error
        const userHandle = '@' + (user.email?.split('@')[0] || 'user')
        const tab = searchParams?.get('tab')
        const tabParam = tab ? `?tab=${tab}` : ''
        router.push(`/directory/${userHandle}/free${tabParam}`)
      }
    }

    redirectToTierPage()
  }, [user, loading, router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your directory profile...</p>
        </div>
      </div>
    )
  }

  // This component will redirect, so we don't need the original content
  return null
}
