// Bulk upload utilities for CSV parsing and validation

interface ProfileData {
  display_name: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  website_url?: string
  phone_number?: string
  email?: string
  facebook_connection?: string
  google_my_business_connection?: string
  business_category: string
  business_location: string
  bio?: string
}

interface ValidationResult {
  valid: ProfileData[]
  errors: string[]
}

interface LocationResult {
  created: number
  errors: string[]
}

/**
 * Parse CSV text into profile data array
 */
export async function parseBulkUploadCSV(csvText: string): Promise<ProfileData[]> {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim())
  
  // Expected column order: display_name,address,city,province,website_url,phone_number,email,business_category
  const expectedHeaders = [
    'display_name',
    'address',
    'city',
    'province',
    'website_url',
    'phone_number',
    'email',
    'business_category'
  ]

  // Validate headers
  const hasRequiredHeaders = expectedHeaders.every(header => headers.includes(header))
  if (!hasRequiredHeaders) {
    console.error('Missing required headers. Expected:', expectedHeaders)
    return []
  }

  // Parse data rows
  const profiles: ProfileData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length !== headers.length) continue

    const profile: ProfileData = {
      display_name: '',
      business_category: '',
      business_location: ''
    }

    // Map values to profile object
    headers.forEach((header, index) => {
      const value = values[index] || ''
      switch (header) {
        case 'display_name':
          profile.display_name = value
          break
        case 'address':
          profile.address = value
          break
        case 'city':
          profile.city = value
          break
        case 'province':
          profile.province = value
          break
        case 'website_url':
          profile.website_url = value
          break
        case 'phone_number':
          profile.phone_number = value
          break
        case 'email':
          profile.email = value
          break
        case 'business_category':
          profile.business_category = value
          break
        default:
          // Handle any additional columns
          break
      }
    })

    // Generate business_location slug from city/province if not provided
    if (!profile.business_location && profile.city) {
      profile.business_location = generateLocationSlug(profile.city, profile.province)
    }

    // Only add if required fields are present
    if (profile.display_name && profile.business_category && profile.city) {
      profiles.push(profile)
    }
  }

  return profiles
}

/**
 * Validate profile data
 */
export async function validateProfileData(profiles: ProfileData[]): Promise<ValidationResult> {
  const valid: ProfileData[] = []
  const errors: string[] = []

  for (const profile of profiles) {
    const profileErrors: string[] = []

    // Required field validation
    if (!profile.display_name?.trim()) {
      profileErrors.push('Display name is required')
    }

    if (!profile.business_category?.trim()) {
      profileErrors.push('Business category is required')
    }

    if (!profile.business_location?.trim()) {
      profileErrors.push('Business location is required')
    }

    // Email validation (if provided)
    if (profile.email && !isValidEmail(profile.email)) {
      profileErrors.push('Invalid email format')
    }

    // Website URL validation (if provided)
    if (profile.website_url && !isValidUrl(profile.website_url)) {
      profileErrors.push('Invalid website URL format')
    }

    if (profileErrors.length === 0) {
      valid.push(profile)
    } else {
      errors.push(`Profile "${profile.display_name}": ${profileErrors.join(', ')}`)
    }
  }

  return { valid, errors }
}

/**
 * Create missing locations in the database
 */
export async function createMissingLocations(profiles: ProfileData[]): Promise<LocationResult> {
  // For now, return a mock result since location creation logic would need Supabase client
  // This should be implemented to check existing locations and create missing ones
  
  return {
    created: 0,
    errors: []
  }
}

/**
 * Email validation helper
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * URL validation helper
 */
function isValidUrl(url: string): boolean {
  try {
    // Add protocol if missing
    const urlToTest = url.startsWith('http') ? url : `https://${url}`
    new URL(urlToTest)
    return true
  } catch {
    return false
  }
}

/**
 * Generate location slug from city and province
 */
export function generateLocationSlug(city: string, province?: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const provinceSlug = province ? province.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''
  
  return provinceSlug ? `${citySlug}-${provinceSlug}` : citySlug
}
