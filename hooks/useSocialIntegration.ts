import { useEffect, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface QRCodeData {
  sessionId: string
  qr: string
}

interface IntegrationStatus {
  connected: boolean
  qrCode?: string
  message?: string
}

export function useSocialIntegration(platform: 'whatsapp' = 'whatsapp') {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [qrCode, setQRCode] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [groups, setGroups] = useState<any[]>([])

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const persistentSessionId = `${platform}-persistent`
      setSessionId(persistentSessionId)
      
      try {
        const response = await fetch(`/api/${platform}/status/${persistentSessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.connected) {
            setIsConnected(true)
            console.log(`✅ Found existing ${platform} session`)
          }
        }
      } catch (err) {
        console.log(`No existing ${platform} session found`)
      }
    }
    
    checkExistingSession()
  }, [platform])

  // Poll for status updates when session exists but not connected
  useEffect(() => {
    if (!sessionId || isConnected) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/${platform}/status/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.connected && !isConnected) {
            setIsConnected(true)
            console.log(`✅ ${platform} connection detected!`)
          }
        }
      } catch (err) {
        // Silently fail on poll errors
      }
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [sessionId, isConnected, platform])

  // Initialize socket connection
  useEffect(() => {
    // Connect directly to backend for Socket.io (WebSocket proxy doesn't work well)
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
    console.log('🔌 Connecting to Socket.io server:', backendUrl)
    
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['polling', 'websocket']
    })

    newSocket.on('connect', () => {
      console.log(`✅ Connected to server for ${platform}`)
    })

    newSocket.on('disconnect', () => {
      console.log(`❌ Disconnected from server for ${platform}`)
      setIsConnected(false)
    })

    // Listen for all events (debug)
    newSocket.onAny((event, ...args) => {
      if (event.startsWith('whatsapp')) {
        console.log(`📡 Received event: ${event}`, args)
      }
    })

    // WhatsApp events
    if (platform === 'whatsapp') {
      newSocket.on('whatsapp:qr', (data: QRCodeData) => {
        console.log('✅ QR Code received from server:', data.sessionId)
        console.log('📸 QR Code data length:', data.qr?.length)
        setQRCode(data.qr)
        setSessionId(data.sessionId)
      })

      newSocket.on('whatsapp:ready', (data: { sessionId: string }) => {
        console.log('WhatsApp ready:', data.sessionId)
        setIsConnected(true)
        setQRCode(null)
        setError(null)
      })

      newSocket.on('whatsapp:auth-failed', (data: { sessionId: string; error: string }) => {
        console.error('WhatsApp auth failed:', data.error)
        setError(data.error)
        setQRCode(null)
      })

      newSocket.on('whatsapp:message', (data: any) => {
        console.log('New message:', data.message)
      })
    }

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [platform])

  // Initialize integration
  const initializeIntegration = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const persistentSessionId = `${platform}-persistent`
      setSessionId(persistentSessionId)

      // Use local API endpoint (proxied through Next.js)
      const initUrl = `/api/${platform}/init`
      
      console.log(`📡 Initializing ${platform} at:`, initUrl)

      const response = await fetch(initUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: persistentSessionId })
      })

      console.log(`📡 Response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to initialize ${platform}: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ ${platform} initialization response:`, data)
      
      // Poll for QR code since Socket.io might not work
      console.log(`⏳ Polling for QR code...`)
      let attempts = 0
      const maxAttempts = 60 // 60 * 500ms = 30 seconds
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        try {
          const statusResponse = await fetch(`/api/${platform}/status/${persistentSessionId}`)
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            if (statusData.qrCode) {
              console.log(`✅ QR Code received after ${(attempts + 1) * 500}ms`)
              setQRCode(statusData.qrCode)
              return
            }
          }
        } catch (err) {
          console.error(`Error polling status:`, err)
        }
        
        attempts++
        if (attempts % 4 === 0) {
          console.log(`⏳ Still waiting for QR code... (${attempts * 500}ms)`)
        }
      }
      
      console.log(`⚠️ QR code not received after 30 seconds`)
      setError('QR code generation timeout')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`❌ Error initializing ${platform}:`, err)
    } finally {
      setIsLoading(false)
    }
  }, [platform])

  // Get status
  const getStatus = useCallback(async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/${platform}/status/${sessionId}`)

      if (!response.ok) {
        throw new Error(`Failed to get ${platform} status`)
      }

      const data: IntegrationStatus = await response.json()
      setIsConnected(data.connected)
      return data
    } catch (err) {
      console.error(`Error getting ${platform} status:`, err)
    }
  }, [platform, sessionId])

  // Get all contacts from groups
  const getGroupContacts = useCallback(async () => {
    if (!sessionId || platform !== 'whatsapp') {
      console.log(`⚠️ Cannot fetch group contacts: sessionId=${sessionId}, platform=${platform}`)
      return
    }

    try {
      const url = `/api/${platform}/group-contacts/${sessionId}`
      console.log(`📡 Fetching group contacts from: ${url}`)
      
      const response = await fetch(url)
      console.log(`📊 Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Server error: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get group contacts: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📦 Raw response data:`, data)
      console.log(`✅ Fetched ${data.total} unique contacts from groups`)
      console.log(`📋 Contacts:`, data.contacts)
      
      return data.contacts
    } catch (err) {
      console.error(`❌ Error getting group contacts:`, err)
      return []
    }
  }, [platform, sessionId])

  // Get groups (WhatsApp only)
  const getGroups = useCallback(async () => {
    if (!sessionId || platform !== 'whatsapp') {
      console.log(`⚠️ Cannot fetch groups: sessionId=${sessionId}, platform=${platform}`)
      return
    }

    try {
      const url = `/api/${platform}/groups/${sessionId}`
      console.log(`📡 Fetching groups from: ${url}`)
      
      const response = await fetch(url)
      console.log(`📊 Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Server error: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get ${platform} groups: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📦 Raw response data:`, data)
      
      const groupsList = data.groups || []
      setGroups(groupsList)
      console.log(`✅ Fetched ${groupsList.length} groups`)
      console.log(`📋 Groups:`, groupsList)
      
      return groupsList
    } catch (err) {
      console.error(`❌ Error getting ${platform} groups:`, err)
      setGroups([])
    }
  }, [platform, sessionId])

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/${platform}/disconnect/${sessionId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${platform}`)
      }

      setIsConnected(false)
      setQRCode(null)
      setSessionId(null)
    } catch (err) {
      console.error(`Error disconnecting ${platform}:`, err)
    }
  }, [platform, sessionId])

  // Send message to group or user
  const sendMessage = useCallback(async (chatId: string, message: string) => {
    if (!sessionId || platform !== 'whatsapp') {
      console.log(`⚠️ Cannot send message: sessionId=${sessionId}, platform=${platform}`)
      return
    }

    try {
      const url = `/api/${platform}/send-message/${sessionId}`
      console.log(`📨 Sending message to ${chatId}...`)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Message sent successfully`)
      return data
    } catch (err) {
      console.error(`❌ Error sending message:`, err)
      throw err
    }
  }, [platform, sessionId])

  return {
    qrCode,
    isConnected,
    isLoading,
    error,
    sessionId,
    groups,
    initializeIntegration,
    getStatus,
    getGroups,
    getGroupContacts,
    sendMessage,
    disconnect,
    socket
  }
}
