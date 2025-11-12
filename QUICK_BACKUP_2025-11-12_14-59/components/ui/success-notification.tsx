'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'

interface SuccessNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function SuccessNotification({ 
  message, 
  isVisible, 
  onClose, 
  duration = 4000 
}: SuccessNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] max-w-md"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-6 h-6 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <p className="font-black text-white uppercase text-sm">Success!</p>
              <p className="font-bold text-white text-sm">{message}</p>
            </div>
            
            <button
              onClick={onClose}
              className="bg-white text-green-500 p-1 rounded border-2 border-black font-black hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white rounded-b-lg"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
