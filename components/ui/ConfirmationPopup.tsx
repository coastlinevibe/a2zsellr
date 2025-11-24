'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationPopupProps {
  isOpen: boolean
  title: string
  message: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

export function ConfirmationPopup({
  isOpen,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmationPopupProps) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  if (!isVisible) return null

  const handleConfirm = () => {
    setIsVisible(false)
    onConfirm()
  }

  const handleCancel = () => {
    setIsVisible(false)
    onCancel()
  }

  const bgColor = isDangerous ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
  const textColor = isDangerous ? 'text-red-800' : 'text-yellow-800'
  const iconColor = isDangerous ? 'text-red-600' : 'text-yellow-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full rounded-xl border-2 border-black p-4 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${bgColor}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 bg-white p-1 rounded-lg border border-black ${iconColor}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black uppercase ${textColor}`}>{title}</p>
          <p className={`text-xs font-bold mt-1 opacity-90 ${textColor}`}>{message}</p>
          {description && (
            <p className={`text-xs mt-2 opacity-75 ${textColor}`}>{description}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-2 border-black rounded-[6px] text-xs font-bold h-8"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 rounded-[6px] text-white font-bold text-xs h-8 ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="flex-shrink-0 bg-white hover:bg-gray-100 p-1 rounded-full border border-black transition-colors"
        >
          <X className="w-3 h-3 text-black" />
        </button>
      </div>
    </motion.div>
  )
}
