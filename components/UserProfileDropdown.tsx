'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { User, Settings, Star, Gift, HelpCircle, LogOut, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function UserProfileDropdown() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.charAt(0).toUpperCase()
  const userHandle = '@' + (user.email?.split('@')[0] || 'user')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setIsOpen(false)
  }

  const handleAction = (action: string) => {
    setIsOpen(false)
    
    switch (action) {
      case 'settings':
        router.push('/settings')
        break
      case 'upgrade':
        router.push('/choose-plan')
        break
      case 'referrals':
        router.push('/referrals')
        break
      case 'help':
        router.push('/support')
        break
      case 'logout':
        handleSignOut()
        break
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {displayName}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-20">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold">
                  {initials}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{displayName}</h3>
                  <p className="text-sm text-gray-500">{userHandle}</p>
                  <Badge className="bg-gray-100 text-gray-700 text-xs mt-1">
                    Free
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {/* Profile Section */}
              <div className="mb-2">
                <button
                  onClick={() => handleAction('settings')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-2 mb-2">
                {/* Upgrade */}
                <button
                  onClick={() => handleAction('upgrade')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Upgrade to Premium</span>
                  </div>
                  <Badge className="bg-amber-600 text-white text-xs">
                    Early Adopter
                  </Badge>
                </button>

                {/* Referrals */}
                <button
                  onClick={() => handleAction('referrals')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Gift className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Referrals</span>
                </button>

                {/* Support */}
                <button
                  onClick={() => handleAction('help')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Support</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => handleAction('logout')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
