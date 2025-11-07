'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sun, Moon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface CompactWeeklyScheduleProps {
  weeklySchedule: Record<string, { open: string; close: string; closed: boolean }>
  updateDaySchedule: (day: string, field: string, value: string | boolean) => void
  getTodayHoursFromSchedule: (schedule: any) => string
}

const daysOfWeek = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' }
]

// Helper functions for time format conversion
const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${ampm}`
}

const formatTimeTo24Hour = (time12: string): string => {
  if (!time12) return ''
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time12 // Return as-is if not in expected format
  
  const [, hour, minutes, ampm] = match
  let hour24 = parseInt(hour, 10)
  
  if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
    hour24 += 12
  } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
    hour24 = 0
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`
}

// Custom time picker component with AM/PM display
const TimePickerAMPM = ({ 
  value, 
  onChange, 
  className 
}: { 
  value: string
  onChange: (value: string) => void
  className?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempTime, setTempTime] = useState(value)

  const displayTime = formatTimeTo12Hour(value)

  const handleTimeChange = (newTime: string) => {
    setTempTime(newTime)
    const time24 = formatTimeTo24Hour(newTime)
    onChange(time24)
    setIsOpen(false)
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const minuteStr = minute.toString().padStart(2, '0')
        options.push(`${hour}:${minuteStr} AM`)
        options.push(`${hour}:${minuteStr} PM`)
      }
    }
    return options
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={displayTime}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        className={`cursor-pointer ${className}`}
        placeholder="Select time"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto w-24">
          {generateTimeOptions().map((timeOption) => (
            <div
              key={timeOption}
              onClick={() => handleTimeChange(timeOption)}
              className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
            >
              {timeOption}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CompactWeeklySchedule({ 
  weeklySchedule, 
  updateDaySchedule, 
  getTodayHoursFromSchedule 
}: CompactWeeklyScheduleProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayHours = getTodayHoursFromSchedule(weeklySchedule)
  
  // Format today's hours to AM/PM format
  const formatTodayHours = (hours: string): string => {
    if (hours === 'Closed') return hours
    
    // Parse hours like "09:00 - 17:00" and convert to AM/PM
    const match = hours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (match) {
      const [, openTime, closeTime] = match
      return `${formatTimeTo12Hour(openTime)} - ${formatTimeTo12Hour(closeTime)}`
    }
    
    return hours // Return as-is if format doesn't match
  }
  
  const formattedTodayHours = formatTodayHours(todayHours)

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Today's Hours Highlight - Compact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-sm">Today's Hours</span>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formattedTodayHours}</div>
            <div className="text-xs text-emerald-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Weekly Schedule */}
      <motion.div
        variants={containerVariants}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h5 className="font-medium text-gray-900 text-sm">Weekly Schedule</h5>
        </div>

        <div className="p-4 space-y-3">
          {daysOfWeek.map((day, index) => {
            const daySchedule = weeklySchedule[day.key as keyof typeof weeklySchedule]
            const isToday = day.key === today

            return (
              <motion.div
                key={day.key}
                variants={itemVariants}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isToday 
                    ? 'border-emerald-300 bg-emerald-50' 
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                {/* Day and Status */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  
                  {/* Hours Display */}
                  <div className="text-sm text-gray-600">
                    {daySchedule.closed ? (
                      <span className="text-red-600 font-medium">Closed</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        {formatTimeTo12Hour(daySchedule.open)} - {formatTimeTo12Hour(daySchedule.close)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Time Inputs - Only show when open */}
                  <AnimatePresence>
                    {!daySchedule.closed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <TimePickerAMPM
                            value={daySchedule.open}
                            onChange={(value) => updateDaySchedule(day.key, 'open', value)}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500" />
                          <TimePickerAMPM
                            value={daySchedule.close}
                            onChange={(value) => updateDaySchedule(day.key, 'close', value)}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Open/Closed Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {daySchedule.closed ? 'Closed' : 'Open'}
                    </span>
                    <Switch
                      checked={!daySchedule.closed}
                      onCheckedChange={(checked: boolean) => {
                        updateDaySchedule(day.key, 'closed', !checked)
                      }}
                      className="data-[state=checked]:bg-emerald-500 scale-75"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Quick setup:</span>
            <div className="flex gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const mondaySchedule = weeklySchedule.monday
                  if (mondaySchedule) {
                    daysOfWeek.forEach(day => {
                      if (day.key !== 'monday') {
                        updateDaySchedule(day.key, 'closed', mondaySchedule.closed)
                        if (!mondaySchedule.closed) {
                          updateDaySchedule(day.key, 'open', mondaySchedule.open)
                          updateDaySchedule(day.key, 'close', mondaySchedule.close)
                        }
                      }
                    })
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-all shadow-sm border border-purple-200"
              >
                Copy Monday to All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  daysOfWeek.forEach(day => {
                    updateDaySchedule(day.key, 'closed', false)
                    updateDaySchedule(day.key, 'open', '09:00')
                    updateDaySchedule(day.key, 'close', '17:00')
                  })
                }}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-all shadow-sm border border-emerald-200"
              >
                9-5 Daily
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Set weekdays (Mon-Fri) to 9-5
                  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((day: string) => {
                    updateDaySchedule(day, 'closed', false)
                    updateDaySchedule(day, 'open', '09:00')
                    updateDaySchedule(day, 'close', '17:00')
                  })
                  // Set Saturday to 9-2
                  updateDaySchedule('saturday', 'closed', false)
                  updateDaySchedule('saturday', 'open', '09:00')
                  updateDaySchedule('saturday', 'close', '14:00')
                  // Set Sunday to closed
                  updateDaySchedule('sunday', 'closed', true)
                }}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-all shadow-sm border border-blue-200"
              >
                Weekdays + Sat AM
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
