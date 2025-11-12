'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const DateTimePicker = ({ value, onChange, className = '' }: DateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [popupPosition, setPopupPosition] = useState<'below' | 'above'>('below')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Parse the current value
  const selectedDateTime = (() => {
    if (!value) return null
    try {
      const date = new Date(value + ':00')
      // Check if the date is valid
      if (isNaN(date.getTime())) return null
      return date
    } catch {
      return null
    }
  })()

  const formatDisplayValue = () => {
    if (!selectedDateTime || isNaN(selectedDateTime.getTime())) return 'Select date and time'
    return selectedDateTime.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleDateSelect = (date: Date) => {
    const newDateTime = new Date(date)
    if (selectedDateTime) {
      newDateTime.setHours(selectedDateTime.getHours())
      newDateTime.setMinutes(selectedDateTime.getMinutes())
    }
    // Store as local time string in format YYYY-MM-DDTHH:mm
    const localString = newDateTime.getFullYear() + '-' +
      String(newDateTime.getMonth() + 1).padStart(2, '0') + '-' +
      String(newDateTime.getDate()).padStart(2, '0') + 'T' +
      String(newDateTime.getHours()).padStart(2, '0') + ':' +
      String(newDateTime.getMinutes()).padStart(2, '0')
    onChange(localString)
  }

  const handleTimeSelect = (hours: number, minutes: number) => {
    const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date()
    newDateTime.setHours(hours, minutes, 0, 0) // Set hours, minutes, seconds, milliseconds
    // Store as local time string in format YYYY-MM-DDTHH:mm
    const localString = newDateTime.getFullYear() + '-' +
      String(newDateTime.getMonth() + 1).padStart(2, '0') + '-' +
      String(newDateTime.getDate()).padStart(2, '0') + 'T' +
      String(newDateTime.getHours()).padStart(2, '0') + ':' +
      String(newDateTime.getMinutes()).padStart(2, '0')
    onChange(localString)
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDateTime && date.toDateString() === selectedDateTime.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Calculate popup position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popupHeight = 400 // Approximate height of popup
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        setPopupPosition('above')
      } else {
        setPopupPosition('below')
      }
    }
  }, [isOpen])

  const minuteOptions = Array.from({ length: 12 }, (_, index) => index * 5)

  // Close time dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showTimeDropdown && !target.closest('.time-dropdown-container')) {
        setShowTimeDropdown(false)
      }
      if (showMinuteDropdown && !target.closest('.minute-dropdown-container')) {
        setShowMinuteDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTimeDropdown, showMinuteDropdown])

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white text-left flex items-center justify-between hover:bg-blue-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDisplayValue()}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Custom Picker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 ${
              popupPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
            } left-0`}
          >
            <div className="bg-white border-2 border-black rounded-[9px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] p-4 min-w-[320px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-black text-lg">Schedule Campaign</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Date
                </h4>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold">
                    {currentDate.toLocaleString('en-ZA', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((date, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                        isSelected(date)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : isToday(date)
                          ? 'bg-emerald-100 text-emerald-700 font-semibold'
                          : isCurrentMonth(date)
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-[9px] p-3 space-y-3">
                  {/* Custom Time Dropdown Trigger */}
                  <div className="relative time-dropdown-container">
                    <button
                      onClick={() => {
                        setShowTimeDropdown(!showTimeDropdown)
                        if (!showTimeDropdown) setShowMinuteDropdown(false)
                      }}
                      className="w-full p-3 bg-white border-2 border-black rounded-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-black">
                          {selectedDateTime && !isNaN(selectedDateTime.getTime())
                            ? selectedDateTime.getHours().toString().padStart(2, '0')
                            : 'Select hour...'}
                        </span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Custom Time Dropdown Options */}
                    <AnimatePresence>
                      {showTimeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute top-full left-0 mt-2 z-50 bg-white border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] min-w-[200px] max-h-48 overflow-y-auto"
                        >
                          {Array.from({ length: 24 }, (_, hour) => (
                            <button
                              key={hour}
                              onClick={() => {
                                handleTimeSelect(hour, (selectedDateTime && !isNaN(selectedDateTime.getTime())) ? selectedDateTime.getMinutes() : 0)
                                setShowTimeDropdown(false)
                              }}
                              className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                selectedDateTime && !isNaN(selectedDateTime.getTime()) && selectedDateTime.getHours() === hour ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'
                              }`}
                            >
                              {hour.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Minute Dropdown */}
                  <div className="relative minute-dropdown-container">
                    <button
                      onClick={() => {
                        setShowMinuteDropdown(!showMinuteDropdown)
                        if (!showMinuteDropdown) setShowTimeDropdown(false)
                      }}
                      className="w-full p-3 bg-white border-2 border-black rounded-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-black">
                          {selectedDateTime && !isNaN(selectedDateTime.getTime())
                            ? selectedDateTime.getMinutes().toString().padStart(2, '0')
                            : 'Select minutes...'}
                        </span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showMinuteDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showMinuteDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute top-full left-0 mt-2 z-50 bg-white border-2 border-black rounded-[9px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] min-w-[200px] max-h-48 overflow-y-auto"
                        >
                          {minuteOptions.map((minute) => (
                            <button
                              key={minute}
                              onClick={() => {
                                handleTimeSelect(
                                  (selectedDateTime && !isNaN(selectedDateTime.getTime())) ? selectedDateTime.getHours() : 0,
                                  minute
                                )
                                setShowMinuteDropdown(false)
                              }}
                              className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                selectedDateTime && !isNaN(selectedDateTime.getTime()) && selectedDateTime.getMinutes() === minute ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'
                              }`}
                            >
                              {minute.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-xs text-gray-500">
                    Choose both hour and minutes to schedule precisely
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onChange('')}
                  variant="outline"
                  className="flex-1 border-2 border-black rounded-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                >
                  Clear Schedule
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                >
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DateTimePicker
