'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

interface TourStep {
  target: string
  title: string
  description: string
  action: string
  onClick?: () => void
  preAction?: () => void
  isLast?: boolean
}

interface DashboardTourProps {
  isOpen: boolean
  currentStep: number
  steps: TourStep[]
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

export function DashboardTour({
  isOpen,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose
}: DashboardTourProps) {
  if (!isOpen) return null

  // Show completion screen when tour is done
  const isComplete = currentStep >= steps.length

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-2xl border-2 border-black p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-emerald-500" />
          </div>

          <h2 className="text-3xl font-black text-black text-center mb-3">
            🎉 Tour Complete!
          </h2>

          <p className="text-gray-700 text-center mb-6 leading-relaxed text-sm">
            You now understand your dashboard! You're ready to start growing your business. Add your first product or create a listing to get started.
          </p>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all"
            >
              Start Exploring! 🚀
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const step = steps[currentStep]
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  // Recalculate position when step changes (with delay to allow DOM to update)
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetElement = document.getElementById(step.target)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
      } else {
        // Retry after another delay if element not found
        const retryTimer = setTimeout(() => {
          const retryElement = document.getElementById(step.target)
          if (retryElement) {
            const rect = retryElement.getBoundingClientRect()
            setPosition({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height
            })
          }
        }, 200)
        return () => clearTimeout(retryTimer)
      }
    }, 150) // 150ms delay to allow DOM to update after tab navigation

    return () => clearTimeout(timer)
  }, [currentStep, step.target])

  const handleAction = () => {
    // Execute preAction first (like navigating to a tab)
    if (step.preAction) {
      step.preAction()
    }
    // Then execute onClick if it exists
    if (step.onClick) {
      step.onClick()
    }
    // Finally advance or close
    if (step.isLast) {
      onClose()
    } else {
      onNext()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with spotlight */}
          <motion.div
            key="tour-overlay"
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Spotlight around target */}
          {position.width > 0 && (
            <>
              {/* Pulsing glow effect */}
              <motion.div
                key="tour-glow"
                className="fixed z-39 rounded-lg pointer-events-none"
                style={{
                  top: position.top - 8,
                  left: position.left - 8,
                  width: position.width + 16,
                  height: position.height + 16
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  boxShadow: [
                    '0 0 20px rgba(16, 185, 129, 0.3)',
                    '0 0 40px rgba(16, 185, 129, 0.6)',
                    '0 0 20px rgba(16, 185, 129, 0.3)'
                  ]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Main spotlight border */}
              <motion.div
                key="tour-spotlight"
                className="fixed z-40 border-2 border-emerald-500 rounded-lg pointer-events-none"
                style={{
                  top: position.top - 8,
                  left: position.left - 8,
                  width: position.width + 16,
                  height: position.height + 16,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </>
          )}

          {/* Tooltip */}
          <motion.div
            key="tour-tooltip"
            className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-black p-6 max-w-sm"
            style={{
              top: Math.max(20, position.top + position.height + 20),
              left: Math.max(20, Math.min(position.left, window.innerWidth - 380))
            }}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <h3 className="text-lg font-black text-black mb-2">{step.title}</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{step.description}</p>

              {/* Progress indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-emerald-500 w-6'
                          : index < currentStep
                          ? 'bg-emerald-300 w-3'
                          : 'bg-gray-300 w-3'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-600">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={onPrev}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg border-2 border-black font-bold text-sm transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleAction}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg border-2 border-black font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                >
                  {step.action}
                  {!step.isLast && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
