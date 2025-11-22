// Test script to verify business hours logic
const isBusinessOpen = (hoursString) => {
  if (!hoursString) return { isOpen: false, status: 'Hours not set' }
  
  try {
    // Try to parse as JSON first (new format)
    const schedule = JSON.parse(hoursString)
    const now = new Date()
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todaySchedule = schedule[today]
    
    if (!todaySchedule) return { isOpen: false, status: 'Hours not available' }
    if (todaySchedule.closed) return { isOpen: false, status: 'Closed today' }
    
    // Get current time in HH:MM format
    const currentTime = now.toTimeString().slice(0, 5)
    const openTime = todaySchedule.open
    const closeTime = todaySchedule.close
    
    // Convert times to minutes for comparison
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    const currentMinutes = timeToMinutes(currentTime)
    const openMinutes = timeToMinutes(openTime)
    const closeMinutes = timeToMinutes(closeTime)
    
    // Handle cases where business closes after midnight
    if (closeMinutes < openMinutes) {
      // Business is open across midnight (e.g., 22:00 - 02:00)
      const isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes
      return { 
        isOpen, 
        status: isOpen ? 'Open' : 'Closed',
        hours: `${openTime} - ${closeTime}`
      }
    } else {
      // Normal business hours (e.g., 09:00 - 17:00)
      const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
      return { 
        isOpen, 
        status: isOpen ? 'Open' : 'Closed',
        hours: `${openTime} - ${closeTime}`
      }
    }
  } catch (error) {
    // Fallback for old text format - just return closed since we can't parse it reliably
    return { isOpen: false, status: 'Check hours' }
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
console.log('Business status:', isBusinessOpen(sampleHours))

// Test with different times by manually setting the time
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
  console.log('Business status:', isBusinessOpen(sampleHours))
  
  // Restore original Date
  global.Date = originalDate
}

// Test different scenarios
testWithTime('10:00', 'Friday')  // Should be Open
testWithTime('18:00', 'Friday')  // Should be Closed (after 17:00)
testWithTime('12:00', 'Sunday')  // Should be Closed (Sunday is closed)
testWithTime('10:00', 'Saturday') // Should be Open (Saturday closes at 14:00)
testWithTime('15:00', 'Saturday') // Should be Closed (Saturday closes at 14:00)