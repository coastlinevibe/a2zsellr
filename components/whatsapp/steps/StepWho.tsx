'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, Hash, X, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface StepWhoProps {
  state: any
  onUpdate: (updates: any) => void
  groups?: Group[]
  contacts?: Contact[]
}

interface Group {
  id: string
  name: string
  participants: number
}

interface Contact {
  userId: string
  phoneNumber: string
  name: string
  groups: string[]
}

interface UserProfile {
  subscription_tier: 'free' | 'premium' | 'business'
}

export default function StepWho({ state, onUpdate, groups: passedGroups = [], contacts: passedContacts = [] }: StepWhoProps) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>(passedGroups)
  const [contacts, setContacts] = useState<Contact[]>(passedContacts)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(passedGroups.length > 0 || passedContacts.length > 0)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const sessionId = user?.id

  // Fetch user profile to check tier
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return
      try {
        const { supabase } = await import('@/lib/supabaseClient')
        
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Profile fetch error:', error)
          return
        }
        
        setProfile(data as UserProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user?.id])

  const userTier = profile?.subscription_tier || 'free'
  const maxGroups = userTier === 'business' ? Infinity : userTier === 'premium' ? 2 : 0
  const maxContacts = userTier === 'premium' ? 80 : userTier === 'business' ? Infinity : 0
  const canSelectGroups = userTier === 'premium' || userTier === 'business'
  const canSelectContacts = userTier === 'premium' || userTier === 'business'
  const contactsExceedLimit = state.recipientType === 'contacts' && state.selectedContacts.length > maxContacts && maxContacts !== Infinity

  const recipientOptions = [
    {
      id: 'groups',
      label: 'Groups',
      description: 'Send to WhatsApp groups',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      description: 'Send direct messages to contacts',
      icon: Phone,
      color: 'green',
    },
    {
      id: 'custom',
      label: 'Custom Numbers',
      description: 'Send to specific phone numbers',
      icon: Hash,
      color: 'purple',
    },
  ]

  // Fetch groups and contacts on mount
  // (This is handled by the setup screen, so we don't need to fetch here)

  const loadGroupsAndContacts = async () => {
    if (!sessionId || dataLoaded) return

    setLoadingGroups(true)
    setLoadingContacts(true)

    try {
      // Only load if we don't already have data
      if (groups.length === 0) {
        const groupsResponse = await fetch(`/api/whatsapp/groups/${sessionId}`)
        const groupsData = await groupsResponse.json()
        setGroups(groupsData.groups || [])
      }

      if (contacts.length === 0) {
        const contactsResponse = await fetch(`/api/whatsapp/group-contacts/${sessionId}`)
        const contactsData = await contactsResponse.json()
        setContacts(contactsData.contacts || [])
      }

      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingGroups(false)
      setLoadingContacts(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 Who should get this message?</h2>
        <p className="text-gray-600">Pick groups, contacts, or phone numbers</p>
      </div>

      {/* Recipient Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipientOptions.map((option) => {
          const Icon = option.icon
          const isSelected = state.recipientType === option.id
          const colorClasses = {
            blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
            green: 'border-green-300 bg-green-50 hover:bg-green-100',
            purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
          }

          return (
            <button
              key={option.id}
              onClick={() => {
                onUpdate({ recipientType: option.id })
                onUpdate({
                  selectedGroups: [],
                  selectedContacts: [],
                  customNumbers: [],
                })
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-100 shadow-lg`
                  : `border-gray-200 bg-white hover:border-gray-300`
              } ${colorClasses[option.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected
                    ? `bg-${option.color}-200`
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isSelected
                      ? `text-${option.color}-600`
                      : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Groups Selection */}
      {state.recipientType === 'groups' && (
        <div className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          {!canSelectGroups && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Premium or Business Required</p>
                  <p className="text-sm text-red-800 mt-1">Upgrade your account to send messages to groups.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Select Groups</h3>
            <span className={`text-sm ${
              state.selectedGroups.length >= maxGroups && maxGroups !== Infinity
                ? 'text-red-600 font-semibold'
                : 'text-gray-600'
            }`}>
              {state.selectedGroups.length}{maxGroups !== Infinity ? `/${maxGroups}` : ''} selected
            </span>
          </div>

          {state.selectedGroups.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-300">
              <p className="text-xs font-semibold text-gray-700 mb-3">Selected Groups:</p>
              <div className="flex flex-wrap gap-2">
                {state.selectedGroups.map((groupId: string) => {
                  const group = groups.find(g => g.id === groupId)
                  return (
                    <div
                      key={groupId}
                      className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-300"
                    >
                      <span className="text-sm font-medium text-gray-900">{group?.name}</span>
                      <button
                        onClick={() => onUpdate({
                          selectedGroups: state.selectedGroups.filter((id: string) => id !== groupId)
                        })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {groups.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {groups.map((group) => {
                const isSelected = state.selectedGroups.includes(group.id)
                const isAtLimit = state.selectedGroups.length >= maxGroups && !isSelected && maxGroups !== Infinity
                const isDisabled = !canSelectGroups || isAtLimit

                return (
                <button
                  key={group.id}
                  onClick={() => {
                    if (isDisabled && !isSelected) return
                    
                    if (isSelected) {
                      onUpdate({
                        selectedGroups: state.selectedGroups.filter((id: string) => id !== group.id)
                      })
                    } else {
                      onUpdate({
                        selectedGroups: [...state.selectedGroups, group.id]
                      })
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-100'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-600">👥 {group.participants} members</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-medium">No groups found</p>
            </div>
          )}
        </div>
      )}

      {/* Contacts Selection */}
      {state.recipientType === 'contacts' && (
        <div className="space-y-4 p-6 bg-green-50 rounded-lg border-2 border-green-200">
          {!canSelectContacts && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Premium or Business Required</p>
                  <p className="text-sm text-red-800 mt-1">Upgrade your account to send direct messages.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Select Contacts</h3>
            <span className={`text-sm ${
              state.selectedContacts.length >= maxContacts && maxContacts !== Infinity
                ? 'text-red-600 font-semibold'
                : 'text-gray-600'
            }`}>
              {state.selectedContacts.length}{maxContacts !== Infinity ? `/${maxContacts}` : ''} selected
            </span>
          </div>

          {state.selectedContacts.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-300">
              <p className="text-xs font-semibold text-gray-700 mb-3">Selected Contacts:</p>
              <div className="flex flex-wrap gap-2">
                {state.selectedContacts.map((contactId: string) => {
                  const contact = contacts.find(c => c.userId === contactId)
                  return (
                    <div
                      key={contactId}
                      className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-300"
                    >
                      <span className="text-sm font-medium text-gray-900">{contact?.name}</span>
                      <button
                        onClick={() => onUpdate({
                          selectedContacts: state.selectedContacts.filter((id: string) => id !== contactId)
                        })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {contacts.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contacts.map((contact) => {
                const isSelected = state.selectedContacts.includes(contact.userId)
                const isAtLimit = state.selectedContacts.length >= maxContacts && !isSelected && maxContacts !== Infinity
                const isDisabled = !canSelectContacts || isAtLimit

                return (
                <button
                  key={contact.userId}
                  onClick={() => {
                    if (isDisabled && !isSelected) return
                    
                    if (isSelected) {
                      onUpdate({
                        selectedContacts: state.selectedContacts.filter((id: string) => id !== contact.userId)
                      })
                    } else {
                      onUpdate({
                        selectedContacts: [...state.selectedContacts, contact.userId]
                      })
                    }
                  }}
                  disabled={isDisabled}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-100'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      <p className="text-sm text-gray-600">{contact.phoneNumber}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-medium">No contacts found</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Numbers */}
      {state.recipientType === 'custom' && (
        <div className="space-y-4 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
          <h3 className="font-bold text-gray-900">Enter Phone Numbers</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Enter phone numbers (one per line, with country code)
            </p>
            <textarea
              placeholder="Example:&#10;+27812345678&#10;+27812345679&#10;+27812345680"
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none h-32 font-mono text-sm"
            />
            <div className="text-xs text-gray-600">
              <p>Format: +[country code][number]</p>
              <p>Example: +27 812 345 678</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Limits Info */}
      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900 mb-2">
          <span className="font-semibold">📋 Your Tier Limits:</span>
        </p>
        <div className="space-y-2 text-sm text-amber-800">
          {userTier === 'free' && (
            <>
              <p>❌ Free tier: Cannot send to groups or DMs. Upgrade to Premium or Business.</p>
            </>
          )}
          {userTier === 'premium' && (
            <>
              <p>✅ Groups: Max <span className="font-bold">2 groups</span></p>
              <p>✅ Contacts: Max <span className="font-bold">80 contacts</span></p>
            </>
          )}
          {userTier === 'business' && (
            <>
              <p>✅ Groups: <span className="font-bold">Unlimited</span></p>
              <p>✅ Contacts: <span className="font-bold">Unlimited</span></p>
              <p>✅ Hourly: <span className="font-bold">Unlimited sends</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
