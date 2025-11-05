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

export default function CompactWeeklySchedule({ 
  weeklySchedule, 
  updateDaySchedule, 
  getTodayHoursFromSchedule 
}: CompactWeeklyScheduleProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const todayHours = getTodayHoursFromSchedule(weeklySchedule)

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
            <div className="font-semibold">{todayHours}</div>
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
                        {daySchedule.open} - {daySchedule.close}
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
                          <input
                            type="time"
                            value={daySchedule.open}
                            onChange={(e) => updateDaySchedule(day.key, 'open', e.target.value)}
                            className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500" />
                          <input
                            type="time"
                            value={daySchedule.close}
                            onChange={(e) => updateDaySchedule(day.key, 'close', e.target.value)}
                            className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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

        {/* Quick Actions - Compact */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Quick setup:</span>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  daysOfWeek.forEach(day => {
                    updateDaySchedule(day.key, 'closed', false)
                    updateDaySchedule(day.key, 'open', '09:00')
                    updateDaySchedule(day.key, 'close', '17:00')
                  })
                }}
                className="px-2 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors"
              >
                9-5 Daily
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
                    updateDaySchedule(day, 'closed', false)
                    updateDaySchedule(day, 'open', '09:00')
                    updateDaySchedule(day, 'close', '17:00')
                  })
                  updateDaySchedule('saturday', 'closed', false)
                  updateDaySchedule('saturday', 'open', '09:00')
                  updateDaySchedule('saturday', 'close', '14:00')
                  updateDaySchedule('sunday', 'closed', true)
                }}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
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
