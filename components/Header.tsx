'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function Header() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
    
    // Always show welcome on home page (permanent banner)
    if (pathname === '/') {
      setShowWelcome(true)
    }
  }, [pathname])

  const handleSignUp = () => {
    router.push('/auth/signup-animated')
  }

  const handleLogin = () => {
    router.push('/auth/login-animated')
  }


  if (!isClient || !showWelcome) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <p className="text-sm font-medium text-emerald-800">
              Welcome to South Africa's Premium Business Directory! Join thousands of businesses growing their reach.
            </p>
          </div>
          <div className="flex shrink-0 gap-2 max-md:flex-wrap">
            <button 
              onClick={handleSignUp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Up for Free Trial
            </button>
            <button 
              onClick={handleLogin}
              className="border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
