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
  messageInterval: 'slow' | 'medium' | 'fast' | 'veryfast' | null
  recipientInterval: 'slow' | 'medium' | 'fast' | 'veryfast' | null
}

interface UserProfile {
  subscription_tier: 'free' | 'premium' | 'business'
}

export default function WhatsAppPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'history' | 'settings'>('dashboard')
  const [currentStep, setCurrentStep] = useState<WizardStep>('what')
  const [profile, setProfile] = useState<UserProfile | null>(null)
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
    messageInterval: null,
    recipientInterval: null,
  })
  const [whatsappGroups, setWhatsappGroups] = useState<any[]>([])
  const [whatsappContacts, setWhatsappContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageHistory, setMessageHistory] = useState<any[]>([])

  // Message tracking interface
  interface MessageRecord {
    id: string
    timestamp: number
    scheduledTime?: number
    status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed'
    contentType: string
    recipientType: string
    recipientCount: number
    recipients: string[]
    message: string
    successCount: number
    failureCount: number
    error?: string
  }

  // Add message to history
  const addMessageToHistory = (record: MessageRecord) => {
    setMessageHistory(prev => [record, ...prev])
    // Save to localStorage for persistence
    const updated = [record, ...messageHistory]
    localStorage.setItem('whatsapp_message_history', JSON.stringify(updated))
  }

  // Load message history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('whatsapp_message_history')
    if (saved) {
      try {
        setMessageHistory(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading message history:', error)
      }
    }
  }, [])

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

  // Get interval delay in milliseconds for messages
  const getIntervalDelay = (interval: string | null): number => {
    switch (interval) {
      case 'slow':
        return Math.random() * (5 * 60 * 1000 - 3 * 60 * 1000) + 3 * 60 * 1000 // 3-5 min
      case 'medium':
        return Math.random() * (2 * 60 * 1000 - 1 * 60 * 1000) + 1 * 60 * 1000 // 1-2 min
      case 'fast':
        return Math.random() * (60 * 1000 - 30 * 1000) + 30 * 1000 // 30-60 sec
      case 'veryfast':
        return Math.random() * (20 * 1000 - 10 * 1000) + 10 * 1000 // 10-20 sec
      default:
        return 1000 // 1 sec default
    }
  }

  // Get interval delay in milliseconds for recipients
  const getRecipientIntervalDelay = (interval: string | null): number => {
    switch (interval) {
      case 'slow':
        return Math.random() * (5 * 60 * 1000 - 3 * 60 * 1000) + 3 * 60 * 1000 // 3-5 min
      case 'medium':
        return Math.random() * (2 * 60 * 1000 - 1 * 60 * 1000) + 1 * 60 * 1000 // 1-2 min
      case 'fast':
        return Math.random() * (60 * 1000 - 30 * 1000) + 30 * 1000 // 30-60 sec
      case 'veryfast':
        return Math.random() * (20 * 1000 - 10 * 1000) + 10 * 1000 // 10-20 sec
      default:
        return 1000 // 1 sec default
    }
  }

  // Send message to groups/contacts
  const sendMessage = async () => {
    if (!user?.id) {
      alert('User not loaded')
      return
    }

    setSending(true)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const userId = user.id
    
    // Start sending in background and immediately go to history
    sendMessagesInBackground(messageId, userId)
    
    // Reset wizard and go to history tab immediately
    resetWizard()
    setActiveTab('history')
  }



  // Background function to send messages
  const sendMessagesInBackground = async (messageId: string, userId: string) => {
    try {
      console.log('📨 Starting to send messages with state:', wizardState)

      // Determine recipients
      let recipients: string[] = []
      
      if (wizardState.recipientType === 'groups') {
        recipients = wizardState.selectedGroups
      } else if (wizardState.recipientType === 'contacts') {
        recipients = wizardState.selectedContacts
      } else if (wizardState.recipientType === 'custom') {
        recipients = wizardState.customNumbers
      }

      if (recipients.length === 0) {
        alert('No recipients selected')
        setSending(false)
        return
      }

      // Build list of messages to send
      let messagesToSend: string[] = []
      
      if (wizardState.contentType === 'custom') {
        messagesToSend = [wizardState.customMessage]
      } else if (wizardState.contentType === 'product') {
        // Create a message for each selected product
        messagesToSend = wizardState.selectedProducts.map((_, index) => 
          `📦 Product ${index + 1}\n\nCheck out this amazing product!\n\nYou have been selected to receive this special offer.`
        )
      } else if (wizardState.contentType === 'listing') {
        // Create a message for each selected listing
        messagesToSend = wizardState.selectedListings.map((_, index) => 
          `📢 Listing ${index + 1}\n\nCheck out this amazing listing!\n\nYou have been selected to receive this special offer.`
        )
      }

      if (messagesToSend.length === 0) {
        alert('No messages to send')
        setSending(false)
        return
      }

      // Add initial message to history
      const initialRecord: MessageRecord = {
        id: messageId,
        timestamp: Date.now(),
        status: 'pending',
        contentType: wizardState.contentType || 'unknown',
        recipientType: wizardState.recipientType || 'unknown',
        recipientCount: recipients.length * messagesToSend.length,
        recipients: recipients,
        message: `${messagesToSend.length} message(s) to ${recipients.length} recipient(s)`,
        successCount: 0,
        failureCount: 0,
      }
      addMessageToHistory(initialRecord)

      // Check if scheduled
      let scheduledTime: number | undefined
      if (wizardState.sendMode === 'schedule' && wizardState.scheduleDateTime) {
        // Parse the datetime-local value correctly (it's in local time, not UTC)
        const dateStr = wizardState.scheduleDateTime
        const [datePart, timePart] = dateStr.split('T')
        const [year, month, day] = datePart.split('-')
        const [hours, minutes] = timePart.split(':')
        
        // Create date in local timezone
        scheduledTime = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        ).getTime()
        
        const now = Date.now()
        
        console.log(`⏰ Scheduled time: ${new Date(scheduledTime).toLocaleString()} (${scheduledTime})`)
        console.log(`⏰ Current time: ${new Date(now).toLocaleString()} (${now})`)
        console.log(`⏰ Difference: ${scheduledTime - now}ms`)
        
        if (scheduledTime > now) {
          const delayMs = scheduledTime - now
          console.log(`⏳ Waiting ${Math.round(delayMs / 1000)} seconds before sending...`)
          
          // Update message status to scheduled
          setMessageHistory(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'scheduled' as const, scheduledTime: scheduledTime } 
              : msg
          ))
          
          // Wait until scheduled time
          await new Promise(resolve => setTimeout(resolve, delayMs))
          console.log(`✅ Scheduled time reached, sending now...`)
        } else {
          console.log(`⚠️ Scheduled time is in the past, sending immediately...`)
        }
      }

      // Send each message to all recipients
      let successCount = 0
      let failureCount = 0
      let lastError = ''

      // Update message status to sending
      setMessageHistory(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sending' as const } : msg
      ))

      // Get interval delays
      const messageIntervalDelay = getIntervalDelay(wizardState.messageInterval)
      const recipientIntervalDelay = getRecipientIntervalDelay(wizardState.recipientInterval)

      // Determine if single message or multiple messages
      const isSingleMessage = messagesToSend.length === 1

      if (isSingleMessage) {
        // Single message to multiple recipients: send to each recipient with interval
        const messageContent = messagesToSend[0]
        console.log(`📨 Sending single message to ${recipients.length} recipients`)
        
        // Use selected recipientInterval or default to 'slow' if not set
        const effectiveRecipientInterval = wizardState.recipientInterval || 'slow'
        const effectiveRecipientIntervalDelay = getRecipientIntervalDelay(effectiveRecipientInterval)
        console.log(`⏱️ Using recipient interval: ${effectiveRecipientInterval} (${Math.round(effectiveRecipientIntervalDelay / 1000)}s)`)

        for (let recipientIndex = 0; recipientIndex < recipients.length; recipientIndex++) {
          const recipient = recipients[recipientIndex]
          try {
            console.log(`📤 Sending message to recipient ${recipientIndex + 1}/${recipients.length}...`)
            const response = await fetch(`/api/whatsapp/send-message/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: recipient,
                message: messageContent,
                options: {
                  delay: 1000,
                }
              })
            })

            if (response.ok) {
              console.log(`✅ Message sent to recipient ${recipientIndex + 1}`)
              successCount++
            } else {
              const error = await response.text()
              console.error(`❌ Failed to send to recipient ${recipientIndex + 1}:`, error)
              failureCount++
              lastError = error
            }

            // Add delay between recipients (but not after the last recipient)
            if (recipientIndex < recipients.length - 1) {
              const delaySeconds = Math.round(effectiveRecipientIntervalDelay / 1000)
              console.log(`⏳ Waiting ${delaySeconds}s before next recipient...`)
              await new Promise(resolve => setTimeout(resolve, effectiveRecipientIntervalDelay))
            }
          } catch (error) {
            console.error(`Error sending to recipient ${recipientIndex + 1}:`, error)
            failureCount++
            lastError = error instanceof Error ? error.message : 'Unknown error'
          }
        }
      } else {
        // Multiple messages to recipients: send each message to all recipients with intervals
        for (let msgIndex = 0; msgIndex < messagesToSend.length; msgIndex++) {
          const messageContent = messagesToSend[msgIndex]
          console.log(`📨 Sending message ${msgIndex + 1}/${messagesToSend.length} to ${recipients.length} recipients`)

          // Send to each recipient
          for (let recipientIndex = 0; recipientIndex < recipients.length; recipientIndex++) {
            const recipient = recipients[recipientIndex]
            try {
              console.log(`📤 Sending message ${msgIndex + 1} to recipient ${recipientIndex + 1}/${recipients.length}...`)
              const response = await fetch(`/api/whatsapp/send-message/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chatId: recipient,
                  message: messageContent,
                  options: {
                    delay: 1000,
                  }
                })
              })

              if (response.ok) {
                console.log(`✅ Message ${msgIndex + 1} sent to recipient ${recipientIndex + 1}`)
                successCount++
              } else {
                const error = await response.text()
                console.error(`❌ Failed to send message ${msgIndex + 1} to recipient ${recipientIndex + 1}:`, error)
                failureCount++
                lastError = error
              }

              // Add delay between recipients (but not after the last recipient)
              if (recipientIndex < recipients.length - 1) {
                const delaySeconds = Math.round(recipientIntervalDelay / 1000)
                console.log(`⏳ Waiting ${delaySeconds}s before next recipient...`)
                await new Promise(resolve => setTimeout(resolve, recipientIntervalDelay))
              }
            } catch (error) {
              console.error(`Error sending message ${msgIndex + 1} to recipient ${recipientIndex + 1}:`, error)
              failureCount++
              lastError = error instanceof Error ? error.message : 'Unknown error'
            }
          }

          // Add interval between messages (but not after the last message)
          if (msgIndex < messagesToSend.length - 1) {
            const delaySeconds = Math.round(messageIntervalDelay / 1000)
            console.log(`⏳ Waiting ${delaySeconds}s before next message...`)
            await new Promise(resolve => setTimeout(resolve, messageIntervalDelay))
          }
        }
      }

      // Update message history with final status
      setMessageHistory(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              status: failureCount === 0 ? 'sent' : failureCount === successCount ? 'failed' : 'sent',
              successCount,
              failureCount,
              error: lastError
            } 
          : msg
      ))

      // Save to localStorage
      const updated = messageHistory.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              status: failureCount === 0 ? 'sent' : failureCount === successCount ? 'failed' : 'sent',
              successCount,
              failureCount,
              error: lastError
            } 
          : msg
      )
      localStorage.setItem('whatsapp_message_history', JSON.stringify(updated))

      console.log(`✅ Campaign complete! Sent: ${successCount}, Failed: ${failureCount}`)
    } catch (error) {
      console.error('Error sending messages:', error)
      // Update message history with error
      setMessageHistory(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Unknown error'
            } 
          : msg
      ))
    } finally {
      setSending(false)
    }
  }

  // Load groups and contacts on mount with dynamic polling
  const loadGroupsAndContacts = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID available')
      return
    }

    try {
      // Load groups with polling until we get results
      console.log(`📨 Fetching groups for user: ${user.id}`)
      let groupsList: any[] = []
      let groupsAttempts = 0
      const maxGroupsAttempts = 20 // Increased from 5 to 20
      
      while (groupsAttempts < maxGroupsAttempts) {
        const groupsResponse = await fetch(`/api/whatsapp/groups/${user.id}`)
        if (!groupsResponse.ok) {
          const errorText = await groupsResponse.text()
          throw new Error(`Failed to load groups: ${errorText}`)
        }
        const groupsData = await groupsResponse.json()
        console.log(`📊 Groups response (attempt ${groupsAttempts}):`, groupsData)
        
        // Handle both { groups: [...] } and direct array responses
        groupsList = Array.isArray(groupsData) ? groupsData : (groupsData.groups || [])
        
        if (groupsList.length > 0) {
          console.log(`✅ Groups found on attempt ${groupsAttempts}:`, groupsList.length)
          break
        }
        
        if (groupsAttempts < maxGroupsAttempts - 1) {
          console.log(`⏳ No groups found, retrying... (attempt ${groupsAttempts + 1}/${maxGroupsAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 500))
          groupsAttempts++
        } else {
          console.log(`⚠️ Max attempts reached, no groups found`)
          break
        }
      }
      
      console.log('✅ Groups list:', groupsList)
      setWhatsappGroups(groupsList)
      console.log('✅ Groups loaded:', groupsList.length)

      // Start polling for contacts with exponential backoff
      setLoadingContacts(true)
      let contactsLoaded = false
      let pollAttempts = 0
      const maxAttempts = 30 // 30 attempts max
      let pollDelay = 2000 // Start with 2 seconds

      while (!contactsLoaded && pollAttempts < maxAttempts) {
        try {
          const contactsResponse = await fetch(`/api/whatsapp/group-contacts/${user.id}`)
          if (!contactsResponse.ok) {
            const errorText = await contactsResponse.text()
            console.error(`❌ Contacts API error (${contactsResponse.status}):`, errorText)
            throw new Error(`Failed to load contacts: ${contactsResponse.status}`)
          }
          
          const contactsData = await contactsResponse.json()
          console.log(`📱 Contacts response (attempt ${pollAttempts}):`, contactsData)
          
          if (contactsData.contacts && contactsData.contacts.length > 0) {
            setWhatsappContacts(contactsData.contacts)
            contactsLoaded = true
            console.log(`✅ Contacts loaded after ${pollAttempts} attempts:`, contactsData.contacts.length)
          } else {
            console.log(`⚠️ No contacts in response, retrying...`)
            pollAttempts++
            if (pollAttempts < maxAttempts) {
              console.log(`⏳ Waiting for contacts... (attempt ${pollAttempts}/${maxAttempts})`)
              await new Promise(resolve => setTimeout(resolve, pollDelay))
              // Increase delay slightly for each attempt (up to 5 seconds max)
              pollDelay = Math.min(pollDelay + 500, 5000)
            }
          }
        } catch (error) {
          console.error(`Error polling contacts (attempt ${pollAttempts}):`, error)
          pollAttempts++
          if (pollAttempts < maxAttempts) {
            console.log(`⏳ Retrying contacts... (attempt ${pollAttempts}/${maxAttempts})`)
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
    if (!user?.id) return
    
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
      messageInterval: null,
      recipientInterval: null,
    })
    setActiveTab('dashboard')
  }

  // Check if tier limits are exceeded
  const checkTierLimits = (): { valid: boolean; message?: string } => {
    const userTier = profile?.subscription_tier || 'free'
    
    if (wizardState.recipientType === 'groups') {
      if (userTier === 'free') {
        return { valid: false, message: 'Free tier cannot send to groups. Upgrade to Premium or Business.' }
      }
      if (userTier === 'premium' && wizardState.selectedGroups.length > 2) {
        return { valid: false, message: `Premium tier allows max 2 groups. You selected ${wizardState.selectedGroups.length}.` }
      }
    }
    
    if (wizardState.recipientType === 'contacts') {
      if (userTier === 'free') {
        return { valid: false, message: 'Free tier cannot send DMs. Upgrade to Premium or Business.' }
      }
    }
    
    return { valid: true }
  }



  const tierCheck = checkTierLimits()
  const canSend = tierCheck.valid && !sending

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
                  <button
                    onClick={loadGroupsAndContacts}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh groups"
                  >
                    <Users className="w-12 h-12 text-blue-100" />
                  </button>
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
                onClick={() => {
                  if (currentStep === 'preview') {
                    if (!tierCheck.valid) {
                      alert(tierCheck.message)
                      return
                    }
                    sendMessage()
                  } else {
                    handleNext()
                  }
                }}
                disabled={currentStep === 'preview' && !canSend}
                title={currentStep === 'preview' && !tierCheck.valid ? tierCheck.message : ''}
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold transition-all flex items-center gap-2"
              >
                {currentStep === 'preview' ? (
                  <>
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Now
                      </>
                    )}
                  </>
                ) : (
                  'Next →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Message History & Queue</h2>
                  <p className="text-gray-600 mt-1">Track sent messages and scheduled campaigns</p>
                </div>
                <button
                  onClick={() => {
                    setMessageHistory([])
                    localStorage.removeItem('whatsapp_message_history')
                  }}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear History
                </button>
              </div>

              {messageHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-6 rounded-full">
                      <History className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-600">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messageHistory.map((msg) => {
                    const statusColors = {
                      pending: { bg: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-200' },
                      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-200' },
                      sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-200' },
                      sent: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-200' },
                      failed: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-200' },
                    }
                    const colors = statusColors[msg.status as keyof typeof statusColors]
                    const scheduledDate = msg.scheduledTime ? new Date(msg.scheduledTime).toLocaleString() : null
                    const sentDate = new Date(msg.timestamp).toLocaleString()

                    return (
                      <div key={msg.id} className={`p-4 rounded-lg border-2 ${colors.bg}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge} ${colors.text}`}>
                                {msg.status.toUpperCase()}
                              </span>
                              {msg.status === 'scheduled' && (
                                <span className="text-xs text-gray-600">
                                  Scheduled for {scheduledDate}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {msg.contentType === 'custom' ? 'Custom Message' : `${msg.contentType.charAt(0).toUpperCase() + msg.contentType.slice(1)}`}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{msg.message}</p>
                            <div className="flex gap-4 text-xs text-gray-600">
                              <span>📤 {msg.recipientCount} recipient{msg.recipientCount !== 1 ? 's' : ''}</span>
                              <span>📍 {msg.recipientType}</span>
                              <span>🕐 {sentDate}</span>
                            </div>
                          </div>
                        </div>

                        {(msg.status === 'sent' || msg.status === 'failed') && (
                          <div className="mt-3 pt-3 border-t border-gray-300 flex gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900">Sent: {msg.successCount}</span>
                              </div>
                            </div>
                            {msg.failureCount > 0 && (
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-gray-900">Failed: {msg.failureCount}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.status === 'sending' && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span className="text-sm text-gray-700">Sending messages...</span>
                            </div>
                          </div>
                        )}

                        {msg.error && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="text-xs text-red-700">Error: {msg.error}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
