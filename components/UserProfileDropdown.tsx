'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { User, Settings, Star, Gift, HelpCircle, LogOut, Crown, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlanSelectionModal } from '@/components/PlanSelectionModal'
import { PaymentMethodModal } from '@/components/PaymentMethodModal'

type SubscriptionTier = 'free' | 'premium' | 'business' | string

interface UserProfileDropdownProps {
  displayName?: string | null
  avatarUrl?: string | null
  subscriptionTier?: SubscriptionTier | null
  userProfile?: any
}

export function UserProfileDropdown({
  displayName: displayNameProp,
  avatarUrl,
  subscriptionTier: subscriptionTierProp,
  userProfile
}: UserProfileDropdownProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'business'>('premium')

  if (!user) return null

  const derivedDisplayName = displayNameProp || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const initials = derivedDisplayName.charAt(0).toUpperCase()
  const userHandle = '@' + (user.email?.split('@')[0] || 'user')
  const tierValue = subscriptionTierProp || user.user_metadata?.subscription_tier || 'free'
  const tierLabel = typeof tierValue === 'string' && tierValue.length > 0
    ? tierValue.charAt(0).toUpperCase() + tierValue.slice(1)
    : 'Free'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setIsOpen(false)
  }

  const handleAction = async (action: string) => {
    setIsOpen(false)
    
    switch (action) {
      case 'settings':
        router.push('/settings')
        break
      case 'upgrade':
        setShowPlanModal(true)
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

  const handlePlanSelection = (plan: 'premium' | 'business') => {
    setSelectedPlan(plan)
    setShowPlanModal(false)
    setShowPaymentModal(true)
  }

  const handleBackToPlanSelection = () => {
    setShowPaymentModal(false)
    setShowPlanModal(true)
  }

  const handleCloseModals = () => {
    setShowPlanModal(false)
    setShowPaymentModal(false)
  }


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Avatar className="h-8 w-8 border border-emerald-100">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={derivedDisplayName} />
          ) : (
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {derivedDisplayName}
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
                <Avatar className="h-12 w-12 border border-emerald-100">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={derivedDisplayName} />
                  ) : (
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-lg">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{derivedDisplayName}</h3>
                  <p className="text-sm text-gray-500">{userHandle}</p>
                  <Badge className={`text-xs mt-1 rounded-[9px] ${
                    tierValue === 'business' 
                      ? 'bg-blue-100 text-blue-700' 
                      : tierValue === 'premium' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tierValue !== 'free' && <Crown className="w-3 h-3 mr-1 inline" />}
                    {tierLabel}
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

              <div className="border-t border-gray-200 pt-3 mb-2">
                {/* Upgrade - Only show for free tier users */}
                {tierValue === 'free' && (
                  <div className="mb-2">
                    <button
                      onClick={() => handleAction('upgrade')}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <Crown className="w-5 h-5" />
                      <span>UPGRADE TO PREMIUM</span>
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                )}

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
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left cursor-not-allowed disabled:opacity-80"
                >
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                  <div className="relative">
                    <span className="font-medium text-gray-400 blur-[3px] opacity-70 select-none">Support</span>
                    <span className="absolute inset-0 flex items-center whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 pointer-events-none drop-shadow-sm">
                      COMING SOON
                    </span>
                  </div>
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

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={handleCloseModals}
        onSelectPlan={handlePlanSelection}
        currentTier={tierValue as 'free' | 'premium' | 'business'}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={handleCloseModals}
        onBack={handleBackToPlanSelection}
        selectedPlan={selectedPlan}
        userProfile={userProfile}
      />

    </div>
  )
}
