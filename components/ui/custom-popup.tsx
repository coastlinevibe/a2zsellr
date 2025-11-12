'use client'

import React from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function CustomPopup({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel
}: CustomPopupProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600'
        }
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          icon: Info,
          iconColor: 'text-blue-600'
        }
    }
  }

  const typeStyles = getTypeStyles()
  const Icon = typeStyles.icon

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] max-w-md w-full">
              {/* Header */}
              <div className={`${typeStyles.bg} rounded-t-xl border-b-4 border-black p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2 border-2 border-black">
                    <Icon className={`w-5 h-5 ${typeStyles.iconColor}`} />
                  </div>
                  <h3 className="text-white font-black text-lg">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="bg-white hover:bg-gray-100 rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t-2 border-gray-200 flex gap-3 justify-end">
                {cancelText && (
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold transition-all"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`${typeStyles.bg} hover:opacity-90 text-white px-6 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold transition-all`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
