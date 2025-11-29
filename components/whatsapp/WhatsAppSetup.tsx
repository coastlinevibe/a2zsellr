'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Loader2, QrCode, Users, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

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

interface WhatsAppSetupProps {
  onSetupComplete: (groups: Group[], contacts: Contact[]) => void
}

export default function WhatsAppSetup({ onSetupComplete }: WhatsAppSetupProps) {
  const router = useRouter()
  const { user } = useAuth()
  const sessionId = user?.id
  
  const [step, setStep] = useState<'connect' | 'loading'>('connect')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [contactsFetched, setContactsFetched] = useState(false)

  const handleConnect = async () => {
    if (!sessionId) {
      alert('User not loaded. Please refresh the page.')
      return
    }

    setConnecting(true)
    setShowQRModal(true)
    setQrCode(null)

    try {
      // Initialize WhatsApp connection
      await fetch('/api/whatsapp/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      // Poll for QR code
      let attempts = 0
      const pollQR = setInterval(async () => {
        attempts++
        try {
          const statusResponse = await fetch(`/api/whatsapp/status/${sessionId}`)
          const statusData = await statusResponse.json()

          if (statusData.qrCode) {
            setQrCode(statusData.qrCode)
          }

          if (statusData.connected) {
            clearInterval(pollQR)
            setConnecting(false)
            setShowQRModal(false)
            setStep('loading')
            loadGroupsAndContacts()
          }

          if (attempts >= 120) {
            clearInterval(pollQR)
            setConnecting(false)
            alert('Connection timeout. Please try again.')
            setShowQRModal(false)
          }
        } catch (error) {
          console.error('Error polling QR:', error)
        }
      }, 1000)
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setConnecting(false)
      setShowQRModal(false)
    }
  }

  const loadGroupsAndContacts = async () => {
    if (!sessionId || loadingData || contactsFetched) return

    setLoadingData(true)
    try {
      // Load groups first
      console.log('Loading groups...')
      const groupsResponse = await fetch(`/api/whatsapp/groups/${sessionId}`)
      const groupsData = await groupsResponse.json()
      setGroups(groupsData.groups || [])
      console.log('Groups loaded:', groupsData.groups?.length || 0)

      // Load contacts (with caching, no need for retries)
      console.log('Fetching contacts...')
      const contactsResponse = await fetch(`/api/whatsapp/group-contacts/${sessionId}`)
      const contactsData = await contactsResponse.json()

      setContacts(contactsData.contacts || [])
      setContactsFetched(true)
      console.log('Contacts loaded:', contactsData.contacts?.length || 0)

      // Complete setup
      onSetupComplete(groupsData.groups || [], contactsData.contacts || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setContacts([])
      setGroups([])
    } finally {
      setLoadingData(false)
    }
  }

  if (step === 'connect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Setup</h1>
          <p className="text-gray-600 mb-8">
            Connect your WhatsApp account to start sending messages to groups and contacts.
          </p>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mb-4"
          >
            {connecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Connect WhatsApp
              </>
            )}
          </button>

          <p className="text-xs text-gray-500">
            You'll need to scan a QR code with your phone to connect.
          </p>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Scan QR Code</h2>
              
              {qrCode ? (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center">
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-full max-w-xs" />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Open WhatsApp on your phone and scan this QR code to connect.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">📱 Steps:</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open WhatsApp on your phone</li>
                  <li>Go to Settings → Linked Devices</li>
                  <li>Tap "Link a Device"</li>
                  <li>Scan the QR code above</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">✅ WhatsApp Connected!</h1>
          <p className="text-gray-600 text-center mb-8">Loading your groups and contacts...</p>

          {loadingData ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Groups Column */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Groups ({groups.length})</h2>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <div key={group.id} className="bg-white border border-blue-200 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-600 font-mono break-all">{group.id}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No groups found</p>
                  )}
                </div>
              </div>

              {/* Contacts Column */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Contacts ({contacts.length})</h2>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contacts.length > 0 ? (
                    contacts.map((contact, idx) => (
                      <div key={idx} className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-600 font-mono break-all">{contact.userId}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No contacts found</p>
                  )}
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => router.push('/whatsapp')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Continue to WhatsApp →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
