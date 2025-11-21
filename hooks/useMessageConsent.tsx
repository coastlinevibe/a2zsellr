'use client'

import { useState, useEffect, useCallback } from 'react'

interface MessageConsentState {
  hasShown: boolean
  hasConsented: boolean | null // null = not answered, true = accepted, false = declined
  timestamp: number | null
}

export function useMessageConsent(businessName: string, listingId: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [consentState, setConsentState] = useState<MessageConsentState>({
    hasShown: false,
    hasConsented: null,
    timestamp: null
  })

  // Storage key for this specific business/listing
  const storageKey = `message_consent_${businessName}_${listingId}`.replace(/[^a-zA-Z0-9_]/g, '_')

  // Load consent state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedState = JSON.parse(stored) as MessageConsentState
        setConsentState(parsedState)
        
        // Don't show popup if user has already interacted with it
        if (parsedState.hasShown && parsedState.hasConsented !== null) {
          return
        }
      }
      
      // Show popup immediately if not shown before
      if (!consentState.hasShown) {
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error loading message consent state:', error)
    }
  }, [storageKey, businessName, listingId])

  // Save consent state to localStorage
  const saveConsentState = useCallback((newState: MessageConsentState) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newState))
      setConsentState(newState)
    } catch (error) {
      console.error('Error saving message consent state:', error)
    }
  }, [storageKey])

  // Handle user accepting the message consent
  const handleAccept = useCallback(async () => {
    const newState: MessageConsentState = {
      hasShown: true,
      hasConsented: true,
      timestamp: Date.now()
    }
    
    saveConsentState(newState)
    
    // Here you could also send this consent to your backend
    try {
      await fetch('/api/track-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          listingId,
          consented: true,
          timestamp: newState.timestamp
        })
      })
    } catch (error) {
      console.error('Error tracking consent:', error)
      // Don't block the UI if tracking fails
    }
    
    setIsOpen(false)
  }, [businessName, listingId, saveConsentState])

  // Handle user declining the message consent
  const handleDecline = useCallback(async () => {
    const newState: MessageConsentState = {
      hasShown: true,
      hasConsented: false,
      timestamp: Date.now()
    }
    
    saveConsentState(newState)
    
    // Track the decline as well
    try {
      await fetch('/api/track-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          listingId,
          consented: false,
          timestamp: newState.timestamp
        })
      })
    } catch (error) {
      console.error('Error tracking consent:', error)
    }
    
    setIsOpen(false)
  }, [businessName, listingId, saveConsentState])

  // Handle closing the popup without action
  const handleClose = useCallback(() => {
    setIsOpen(false)
    // Mark as shown but no consent given
    if (!consentState.hasShown) {
      const newState: MessageConsentState = {
        hasShown: true,
        hasConsented: null,
        timestamp: Date.now()
      }
      saveConsentState(newState)
    }
  }, [consentState.hasShown, saveConsentState])

  return {
    isOpen,
    consentState,
    handleAccept,
    handleDecline,
    handleClose
  }
}