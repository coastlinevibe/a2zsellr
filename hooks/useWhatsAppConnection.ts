import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'

interface WhatsAppConnectionState {
  isConnected: boolean
  isChecking: boolean
  sessionId: string | null
}

// Global state to share across components
let globalConnectionState: WhatsAppConnectionState = {
  isConnected: false,
  isChecking: true,
  sessionId: null
}

let listeners: Set<(state: WhatsAppConnectionState) => void> = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener(globalConnectionState))
}

export const useWhatsAppConnection = () => {
  const { user } = useAuth()
  const [state, setState] = useState<WhatsAppConnectionState>(globalConnectionState)

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (newState: WhatsAppConnectionState) => {
      setState(newState)
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  // Check connection status
  useEffect(() => {
    if (!user?.id) return

    let isMounted = true
    let isChecking = false

    const checkConnection = async () => {
      // Prevent concurrent requests
      if (isChecking) return
      isChecking = true

      try {
        const sid = user.id
        globalConnectionState.sessionId = sid

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(`/api/whatsapp/status/${sid}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        const data = await response.json()

        if (!isMounted) return

        // Only update if connection status changed
        const wasConnected = globalConnectionState.isConnected
        globalConnectionState.isConnected = data.connected === true
        globalConnectionState.isChecking = false
        
        // Only notify if state actually changed
        if (wasConnected !== globalConnectionState.isConnected) {
          console.log(`WhatsApp connection status: ${globalConnectionState.isConnected ? 'connected' : 'disconnected'}`)
          notifyListeners()
        }
      } catch (error) {
        console.error('Error checking WhatsApp connection:', error)
        if (isMounted && globalConnectionState.isConnected) {
          globalConnectionState.isConnected = false
          globalConnectionState.isChecking = false
          notifyListeners()
        }
      } finally {
        isChecking = false
      }
    }

    // Initial check
    globalConnectionState.isChecking = true
    notifyListeners()
    checkConnection()

    // Poll every 5 seconds
    const interval = setInterval(checkConnection, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user?.id])

  return state
}
