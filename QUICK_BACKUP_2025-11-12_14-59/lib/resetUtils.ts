// Utility functions for DAILY reset automation for free tier users (TESTING MODE)

export interface ResetInfo {
  daysRemaining: number
  hoursRemaining: number
  resetDate: Date
  shouldReset: boolean
}

/**
 * Calculate days remaining until reset for free tier users
 * Free tier profiles reset every Sunday
 */
export function calculateResetInfo(createdAt: string | Date, subscriptionTier: string): ResetInfo {
  // Premium and business users never reset
  if (subscriptionTier !== 'free') {
    return {
      daysRemaining: Infinity,
      hoursRemaining: Infinity,
      resetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Far future
      shouldReset: false
    }
  }

  const now = new Date()
  
  // Calculate next Sunday
  const nextSunday = new Date(now)
  const daysUntilSunday = (7 - now.getDay()) % 7
  if (daysUntilSunday === 0 && now.getHours() >= 8) {
    // If it's Sunday after 8 AM, next reset is next Sunday
    nextSunday.setDate(now.getDate() + 7)
  } else {
    nextSunday.setDate(now.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(8, 0, 0, 0) // Reset at 8 AM on Sunday
  
  const resetDate = nextSunday
  
  const msRemaining = resetDate.getTime() - now.getTime()
  const daysRemaining = Math.floor(msRemaining / (24 * 60 * 60 * 1000))
  const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
  const shouldReset = msRemaining <= 0

  return {
    daysRemaining: Math.max(0, daysRemaining),
    hoursRemaining: Math.max(0, hoursRemaining),
    resetDate,
    shouldReset
  }
}

/**
 * Get user-friendly reset message
 */
export function getResetMessage(resetInfo: ResetInfo): string {
  if (!resetInfo.shouldReset) {
    if (resetInfo.daysRemaining > 1) {
      return `Your free tier resets in ${resetInfo.daysRemaining} days`
    } else if (resetInfo.daysRemaining === 1) {
      return `Your free tier resets in 1 day`
    } else if (resetInfo.hoursRemaining > 1) {
      return `Your free tier resets in ${resetInfo.hoursRemaining} hours`
    } else {
      return `Your free tier resets in less than 1 hour`
    }
  }
  return 'Your free tier has reset'
}

/**
 * Check if user should see reset warning (TESTING: 12 hours, 6 hours, or 1 hour before reset)
 */
export function shouldShowResetWarning(resetInfo: ResetInfo): boolean {
  if (resetInfo.shouldReset) return true
  if (resetInfo.hoursRemaining <= 12) return true // Show warning in last 12 hours
  return false
}

/**
 * Get warning severity level (TESTING: adjusted for daily resets)
 */
export function getWarningSeverity(resetInfo: ResetInfo): 'info' | 'warning' | 'danger' {
  if (resetInfo.shouldReset) return 'danger'
  if (resetInfo.hoursRemaining <= 2) return 'danger'  // Critical: less than 2 hours
  if (resetInfo.hoursRemaining <= 6) return 'warning' // Warning: less than 6 hours
  return 'info'
}
