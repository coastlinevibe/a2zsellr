'use client'

import { useState, useCallback } from 'react'

interface PopupConfig {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function useCustomPopup() {
  const [popup, setPopup] = useState<PopupConfig | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const showPopup = useCallback((config: PopupConfig) => {
    setPopup(config)
    setIsOpen(true)
  }, [])

  const hidePopup = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setPopup(null), 200) // Wait for animation
  }, [])

  const showAlert = useCallback((message: string, title: string = 'Alert') => {
    showPopup({
      title,
      message,
      type: 'info'
    })
  }, [showPopup])

  const showError = useCallback((message: string, title: string = 'Error') => {
    showPopup({
      title,
      message,
      type: 'error'
    })
  }, [showPopup])

  const showSuccess = useCallback((message: string, title: string = 'Success') => {
    showPopup({
      title,
      message,
      type: 'success'
    })
  }, [showPopup])

  const showWarning = useCallback((message: string, title: string = 'Warning') => {
    showPopup({
      title,
      message,
      type: 'warning'
    })
  }, [showPopup])

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showPopup({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm()
        hidePopup()
      },
      onCancel: hidePopup
    })
  }, [showPopup, hidePopup])

  return {
    popup,
    isOpen,
    showPopup,
    hidePopup,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showConfirm
  }
}
