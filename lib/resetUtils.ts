// Utility functions for DAILY reset automation for free tier users (TESTING MODE)

export interface ResetInfo {
  daysRemaining: number
  hoursRemaining: number
  resetDate: Date
  shouldReset: boolean
}

/**
 * Calculate time remaining until reset for free tier users
 * The createdAt parameter is the actual reset deadline, not the creation date
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
  let resetDate = new Date(createdAt)
  
  // If reset date is in the past, extend it by 24 hours
  const msRemaining = resetDate.getTime() - now.getTime()
  if (msRemaining <= 0) {
    resetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
  
  const msRemainingUpdated = resetDate.getTime() - now.getTime()
  const daysRemaining = Math.floor(msRemainingUpdated / (24 * 60 * 60 * 1000))
  const hoursRemaining = Math.floor(msRemainingUpdated / (60 * 60 * 1000))
  const shouldReset = msRemainingUpdated <= 0

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
    const msRemaining = resetInfo.resetDate.getTime() - new Date().getTime()
    const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
    const minutesRemaining = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))
    
    return `Your free tier resets in ${hoursRemaining}h ${minutesRemaining}m`
  }
  return 'Your free tier has reset'
}

/**
 * Check if user should see reset warning (always show for free tier)
 */
export function shouldShowResetWarning(resetInfo: ResetInfo): boolean {
  if (resetInfo.shouldReset) return true
  return true // Always show reset countdown for free tier users
}

/**
 * Get warning severity level based on time remaining
 */
export function getWarningSeverity(resetInfo: ResetInfo): 'info' | 'warning' | 'danger' {
  if (resetInfo.shouldReset) return 'danger'
  const msRemaining = resetInfo.resetDate.getTime() - new Date().getTime()
  const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
  
  if (hoursRemaining <= 1) return 'danger'   // Critical: less than 1 hour
  if (hoursRemaining <= 3) return 'warning'  // Warning: less than 3 hours
  return 'info'                               // Info: more than 3 hours
}
