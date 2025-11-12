'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar, Sun, Moon, Coffee, Sunset } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface WeeklyScheduleProps {
  weeklySchedule: Record<string, { open: string; close: string; closed: boolean }>
  updateDaySchedule: (day: string, field: string, value: string | boolean) => void
  getTodayHoursFromSchedule: (schedule: any) => string
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday', short: 'Mon', icon: Coffee, color: 'bg-blue-500' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', icon: Sun, color: 'bg-emerald-500' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', icon: Sun, color: 'bg-amber-500' },
  { key: 'thursday', label: 'Thursday', short: 'Thu', icon: Sun, color: 'bg-orange-500' },
  { key: 'friday', label: 'Friday', short: 'Fri', icon: Sunset, color: 'bg-purple-500' },
  { key: 'saturday', label: 'Saturday', short: 'Sat', icon: Sun, color: 'bg-pink-500' },
  { key: 'sunday', label: 'Sunday', short: 'Sun', icon: Moon, color: 'bg-indigo-500' }
]

export default function AnimatedWeeklySchedule({ 
  weeklySchedule, 
  updateDaySchedule, 
  getTodayHoursFromSchedule 
}: WeeklyScheduleProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  }

  const timeInputVariants = {
    hidden: { opacity: 0, scale: 0.8, height: 0 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      height: 0,
      transition: { duration: 0.2 }
    }
  }

  const todayHours = getTodayHoursFromSchedule(weeklySchedule)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Today's Hours Highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Clock className="w-4 h-4" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold">Today's Hours</h3>
              <p className="text-emerald-100 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <motion.div
            key={todayHours}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
          >
            {todayHours}
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
      </motion.div>

      {/* Weekly Schedule */}
      <motion.div
        variants={containerVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Weekly Schedule</h4>
          </div>
          <p className="text-sm text-gray-600 mt-1">Set your operating hours for each day</p>
        </div>

        <div className="p-6 space-y-3">
          {daysOfWeek.map((day, index) => {
            const daySchedule = weeklySchedule[day.key as keyof typeof weeklySchedule]
            const isToday = day.key === today
            const isExpanded = expandedDay === day.key
            const DayIcon = day.icon

            return (
              <motion.div
                key={day.key}
                variants={itemVariants}
                className={`relative overflow-hidden rounded-lg border transition-all duration-300 ${
                  isToday 
                    ? 'border-emerald-300 bg-emerald-50/50' 
                    : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Day Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-full ${day.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <DayIcon className="w-5 h-5" />
                      </motion.div>

                      {/* Day Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900">{day.label}</h5>
                          {isToday && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Today</Badge>
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {daySchedule.closed ? (
                            <span className="text-red-600 font-medium">Closed</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">
                              {daySchedule.open} - {daySchedule.close}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Open/Closed Toggle */}
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {daySchedule.closed ? 'Closed' : 'Open'}
                        </span>
                        <Switch
                          checked={!daySchedule.closed}
                          onCheckedChange={(checked: boolean) => {
                            updateDaySchedule(day.key, 'closed', !checked)
                            if (checked) {
                              setExpandedDay(day.key)
                            } else {
                              setExpandedDay(null)
                            }
                          }}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Time Inputs */}
                  <AnimatePresence>
                    {!daySchedule.closed && (
                      <motion.div
                        variants={timeInputVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Opening Time
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={daySchedule.open}
                                onChange={(e) => updateDaySchedule(day.key, 'open', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              />
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                              >
                                <Sun className="w-4 h-4 text-amber-500" />
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="space-y-2"
                          >
                            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Closing Time
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={daySchedule.close}
                                onChange={(e) => updateDaySchedule(day.key, 'close', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              />
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                              >
                                <Moon className="w-4 h-4 text-indigo-500" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Quick Time Presets */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-3 flex gap-2 flex-wrap"
                        >
                          {[
                            { label: '9-5', open: '09:00', close: '17:00' },
                            { label: '8-6', open: '08:00', close: '18:00' },
                            { label: '10-8', open: '10:00', close: '20:00' },
                            { label: '24/7', open: '00:00', close: '23:59' }
                          ].map((preset) => (
                            <motion.button
                              key={preset.label}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                updateDaySchedule(day.key, 'open', preset.open)
                                updateDaySchedule(day.key, 'close', preset.close)
                              }}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-md transition-colors"
                            >
                              {preset.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Today indicator line */}
                {isToday && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 px-6 py-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Quick actions:</p>
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
                className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-colors"
              >
                Set All 9-5
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
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              >
                Weekdays + Sat AM
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
