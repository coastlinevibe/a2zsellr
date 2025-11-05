// Utility functions for 7-day reset automation for free tier users

export interface ResetInfo {
  daysRemaining: number
  hoursRemaining: number
  resetDate: Date
  shouldReset: boolean
}

/**
 * Calculate days remaining until reset for free tier users
 * Free tier profiles reset every 7 days (products and listings are cleared)
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

  const created = new Date(createdAt)
  const now = new Date()
  const resetDate = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from creation
  
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
 * Check if user should see reset warning (3 days, 1 day, or 1 hour before reset)
 */
export function shouldShowResetWarning(resetInfo: ResetInfo): boolean {
  if (resetInfo.shouldReset) return true
  if (resetInfo.daysRemaining <= 3) return true
  return false
}

/**
 * Get warning severity level
 */
export function getWarningSeverity(resetInfo: ResetInfo): 'info' | 'warning' | 'danger' {
  if (resetInfo.shouldReset) return 'danger'
  if (resetInfo.daysRemaining <= 1 || resetInfo.hoursRemaining <= 24) return 'danger'
  if (resetInfo.daysRemaining <= 3) return 'warning'
  return 'info'
}
