'use client'

import React, { createContext, useContext } from 'react'
import { useCustomPopup } from '@/hooks/useCustomPopup'
import { CustomPopup } from '@/components/ui/custom-popup'

interface PopupContextType {
  showAlert: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showSuccess: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const {
    popup,
    isOpen,
    hidePopup,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showConfirm
  } = useCustomPopup()

  return (
    <PopupContext.Provider value={{
      showAlert,
      showError,
      showSuccess,
      showWarning,
      showConfirm
    }}>
      {children}
      {popup && (
        <CustomPopup
          isOpen={isOpen}
          onClose={hidePopup}
          title={popup.title}
          message={popup.message}
          type={popup.type}
          confirmText={popup.confirmText}
          cancelText={popup.cancelText}
          onConfirm={popup.onConfirm}
          onCancel={popup.onCancel}
        />
      )}
    </PopupContext.Provider>
  )
}

export function usePopup() {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider')
  }
  return context
}
