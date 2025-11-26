'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, History, Settings, ArrowLeft, Plus, CheckCircle2, Users, Phone, QrCode, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { StepWhat, StepWho, StepHow, PreviewStep } from '@/components/whatsapp/steps'

type WizardStep = 'what' | 'who' | 'how' | 'preview'

interface WizardState {
  contentType: 'product' | 'listing' | 'custom' | null
  selectedProducts: string[]
  selectedListings: string[]
  customMessage: string
  recipientType: 'groups' | 'contacts' | 'custom' | null
  selectedGroups: string[]
  selectedContacts: string[]
  customNumbers: string[]
  sendMode: 'now' | 'schedule' | null
  deliveryMode: 'safe' | 'fast' | null
  scheduleDateTime: string | null
}

export default function WhatsAppPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'history' | 'settings'>('dashboard')
  const [currentStep, setCurrentStep] = useState<WizardStep>('what')
  const [wizardState, setWizardState] = useState<WizardState>({
    contentType: null,
    selectedProducts: [],
    selectedListings: [],
    customMessage: '',
    recipientType: null,
    selectedGroups: [],
    selectedContacts: [],
    customNumbers: [],
    sendMode: null,
    deliveryMode: null,
    scheduleDateTime: null,
  })
  const [whatsappGroups, setWhatsappGroups] = useState<any[]>([])
  const [whatsappContacts, setWhatsappContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Load groups and contacts on mount with dynamic polling
  const loadGroupsAndContacts = async () => {
    if (!user?.id) return

    try {
      // Load groups
      const groupsResponse = await fetch(`/api/whatsapp/groups/${user.id}`)
      if (!groupsResponse.ok) throw new Error('Failed to load groups')
      const groupsData = await groupsResponse.json()
      setWhatsappGroups(groupsData.groups || [])

      // Start polling for contacts with exponential backoff
      setLoadingContacts(true)
      let contactsLoaded = false
      let pollAttempts = 0
      const maxAttempts = 30 // 30 attempts max
      let pollDelay = 2000 // Start with 2 seconds

      while (!contactsLoaded && pollAttempts < maxAttempts) {
        try {
          const contactsResponse = await fetch(`/api/whatsapp/group-contacts/${user.id}`)
          if (!contactsResponse.ok) throw new Error('Failed to load contacts')
          
          const contactsData = await contactsResponse.json()
          
          if (contactsData.contacts && contactsData.contacts.length > 0) {
            setWhatsappContacts(contactsData.contacts)
            contactsLoaded = true
            console.log(`✅ Contacts loaded after ${pollAttempts} attempts:`, contactsData.contacts.length)
          } else {
            pollAttempts++
            if (pollAttempts < maxAttempts) {
              console.log(`⏳ Waiting for contacts... (attempt ${pollAttempts}/${maxAttempts})`)
              await new Promise(resolve => setTimeout(resolve, pollDelay))
              // Increase delay slightly for each attempt (up to 5 seconds max)
              pollDelay = Math.min(pollDelay + 500, 5000)
            }
          }
        } catch (error) {
          console.error('Error polling contacts:', error)
          pollAttempts++
          if (pollAttempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollDelay))
            pollDelay = Math.min(pollDelay + 500, 5000)
          }
        }
      }

      if (!contactsLoaded) {
        console.warn('⚠️ Contacts could not be loaded after maximum attempts')
        setWhatsappContacts([])
      }

      setLoadingContacts(false)
    } catch (error) {
      console.error('Error loading groups and contacts:', error)
      setLoadingContacts(false)
    }
  }

  // Check connection status
  const checkConnection = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/whatsapp/status/${user.id}`)
      const data = await response.json()
      setIsConnected(data.connected || false)
    } catch (error) {
      console.error('Error checking connection:', error)
      setIsConnected(false)
    }
  }

  // Handle WhatsApp connection
  const handleConnect = async () => {
    if (!user?.id) {
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
        body: JSON.stringify({ sessionId: user.id })
      })

      // Poll for QR code
      let attempts = 0
      const pollQR = setInterval(async () => {
        attempts++
        try {
          const statusResponse = await fetch(`/api/whatsapp/status/${user.id}`)
          const statusData = await statusResponse.json()

          if (statusData.qrCode) {
            setQrCode(statusData.qrCode)
          }

          if (statusData.connected) {
            clearInterval(pollQR)
            setConnecting(false)
            setShowQRModal(false)
            setIsConnected(true)
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

  useEffect(() => {
    checkConnection()
    loadGroupsAndContacts()
  }, [user?.id])

  const steps: { id: WizardStep; label: string; icon: typeof MessageSquare }[] = [
    { id: 'what', label: 'Message', icon: MessageSquare },
    { id: 'who', label: 'Recipients', icon: Users },
    { id: 'how', label: 'Settings', icon: Settings },
    { id: 'preview', label: 'Review', icon: CheckCircle2 },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
    }
  }

  const handleStateUpdate = (updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }))
  }

  const resetWizard = () => {
    setCurrentStep('what')
    setWizardState({
      contentType: null,
      selectedProducts: [],
      selectedListings: [],
      customMessage: '',
      recipientType: null,
      selectedGroups: [],
      selectedContacts: [],
      customNumbers: [],
      sendMode: null,
      deliveryMode: null,
      scheduleDateTime: null,
    })
    setActiveTab('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
                <p className="text-xs text-gray-600">Send messages easily</p>
              </div>
            </div>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'send'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Messages Sent</p>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>
                  <Send className="w-12 h-12 text-green-100" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Groups Connected</p>
                    <p className="text-3xl font-bold text-gray-900">{whatsappGroups.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-100" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contacts</p>
                    {loadingContacts ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Loading...</p>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{whatsappContacts.length}</p>
                    )}
                  </div>
                  <Phone className="w-12 h-12 text-purple-100" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold text-green-600">Connected ✓</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-6 rounded-full">
                    <Send className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Send?</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Click below to start sending messages to your groups and contacts.
                </p>
                <button
                  onClick={() => setActiveTab('send')}
                  className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold transition-all"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Send New Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Message Tab */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 border border-gray-200">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = index < currentStepIndex

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all ${
                        isActive
                          ? 'bg-green-500 border-green-600 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-500 border-green-600 text-white'
                          : 'bg-gray-200 border-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-2">
                      <p className={`text-xs font-semibold ${isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-96">
              {currentStep === 'what' && (
                <StepWhat state={wizardState} onUpdate={handleStateUpdate} />
              )}
              {currentStep === 'who' && (
                <StepWho state={wizardState} onUpdate={handleStateUpdate} groups={whatsappGroups} contacts={whatsappContacts} />
              )}
              {currentStep === 'how' && (
                <StepHow state={wizardState} onUpdate={handleStateUpdate} />
              )}
              {currentStep === 'preview' && (
                <PreviewStep state={wizardState} />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Back
              </button>

              <button
                onClick={currentStep === 'preview' ? resetWizard : handleNext}
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
              >
                {currentStep === 'preview' ? '✓ Done' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <History className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Message History</h2>
              <p className="text-gray-600">
                Your sent messages will appear here so you can track what you've sent.
              </p>
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No messages sent yet</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

              {isConnected ? (
                <>
                  {/* Connection Status - Connected */}
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">WhatsApp Connection</p>
                        <p className="text-sm text-gray-600">Your account is connected and ready</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-700">Connected</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900">💡 Quick Tips</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Safe & Slow:</span> Safer for large groups, takes longer
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Fast & Quick:</span> Quicker delivery for urgent messages
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Multiple Groups:</span> Messages are sent with delays to avoid issues
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Help */}
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Need help?</span> Contact support if you have any questions about sending messages.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Connection Status - Not Connected */}
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">WhatsApp Connection</p>
                        <p className="text-sm text-gray-600">Not connected yet</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm font-medium text-red-700">Disconnected</span>
                      </div>
                    </div>
                  </div>

                  {/* Connect with QR Code */}
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Connect Your WhatsApp Account</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Scan the QR code with your phone to link your WhatsApp account.
                        </p>
                      </div>
                      <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {connecting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-5 h-5" />
                            Scan QR Code
                          </>
                        )}
                      </button>
                    </div>
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

                  {/* Help */}
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Need help?</span> Make sure you have WhatsApp installed on your phone and are logged in.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
