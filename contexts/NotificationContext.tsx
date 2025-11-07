'use client'

import React, { createContext, useContext, useState } from 'react'
import { NotificationContainer, useNotifications, type NotificationProps } from '@/components/ui/notification'

interface NotificationContextType {
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  addNotification: (notification: Omit<NotificationProps, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useGlobalNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useGlobalNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { notifications, removeNotification, showSuccess, showError, showInfo, showWarning, addNotification } = useNotifications()

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarning, addNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </NotificationContext.Provider>
  )
}
