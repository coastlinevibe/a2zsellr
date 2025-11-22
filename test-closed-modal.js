// Test script to verify the next opening time logic
const getNextOpeningTime = (hoursString) => {
  if (!hoursString) return null
  
  try {
    const schedule = JSON.parse(hoursString)
    const now = new Date()
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todaySchedule = schedule[today]
    
    // Convert time to minutes for comparison
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    const currentTime = now.toTimeString().slice(0, 5)
    const currentMinutes = timeToMinutes(currentTime)
    
    // Check if we can still open today
    if (todaySchedule && !todaySchedule.closed) {
      const openMinutes = timeToMinutes(todaySchedule.open)
      if (currentMinutes < openMinutes) {
        return `today at ${todaySchedule.open}`
      }
    }
    
    // Look for next opening day
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayIndex = days.indexOf(today)
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7
      const nextDay = days[nextDayIndex]
      const nextDaySchedule = schedule[nextDay]
      
      if (nextDaySchedule && !nextDaySchedule.closed) {
        const dayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1)
        if (i === 1) {
          return `tomorrow at ${nextDaySchedule.open}`
        } else {
          return `${dayName} at ${nextDaySchedule.open}`
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Test with sample business hours
const sampleHours = JSON.stringify({
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '14:00', closed: false },
  sunday: { open: '09:00', close: '17:00', closed: true }
})

console.log('Current time:', new Date().toTimeString().slice(0, 5))
console.log('Current day:', new Date().toLocaleDateString('en-US', { weekday: 'long' }))
console.log('Next opening:', getNextOpeningTime(sampleHours))

// Test different scenarios
const testWithTime = (testTime, testDay) => {
  // Mock the current time for testing
  const originalDate = Date
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super()
        // Override the time methods for testing
        this.toTimeString = () => `${testTime}:00 GMT+0200 (South Africa Standard Time)`
        this.toLocaleDateString = (locale, options) => {
          if (options && options.weekday === 'long') {
            return testDay
          }
          return originalDate.prototype.toLocaleDateString.call(this, locale, options)
        }
      } else {
        super(...args)
      }
    }
    
    static now() {
      return originalDate.now()
    }
  }
  
  console.log(`\nTesting with ${testDay} at ${testTime}:`)
  console.log('Next opening:', getNextOpeningTime(sampleHours))
  
  // Restore original Date
  global.Date = originalDate
}

// Test different scenarios
testWithTime('08:00', 'Friday')  // Should be "today at 09:00"
testWithTime('18:00', 'Friday')  // Should be "tomorrow at 09:00" (Saturday)
testWithTime('15:00', 'Saturday') // Should be "Monday at 09:00" (Sunday is closed)
testWithTime('12:00', 'Sunday')  // Should be "tomorrow at 09:00" (Monday)