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
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  linkedin_url?: string
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
 * Supports multiple CSV formats:
 * Format 1: Keyword, Company Name, Address, Location, Website, Contact No, Email, Facebook Page URL
 * Format 2: display_name;address;city;province;website_url;phone_number;email;business_category
 */
export async function parseBulkUploadCSV(csvText: string): Promise<ProfileData[]> {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Get headers from first line (handle comma, semicolon, and tab separators)
  let separator = ','
  if (lines[0].includes('\t')) separator = '\t'
  else if (lines[0].includes(';')) separator = ';'
  
  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''))
  
  console.log('📋 CSV Headers found:', headers)
  console.log('📋 Using separator:', separator)
  
  // Map different CSV header formats to our expected format
  const headerMapping: { [key: string]: string } = {
    // New format (your described format)
    'Keyword': 'business_category',
    'Company Name': 'display_name', 
    'Address': 'address',
    'Location': 'location',
    'Website': 'website_url',
    'Contact No': 'phone_number',
    'Email': 'email',
    'Facebook Page URL': 'facebook_url',
    
    // Old format (existing sample)
    'display_name': 'display_name',
    'address': 'address', 
    'city': 'city',
    'province': 'province',
    'website_url': 'website_url',
    'phone_number': 'phone_number',
    'email': 'email',
    'business_category': 'business_category'
  }

  // Parse data rows
  const profiles: ProfileData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines
    
    const values = line.split(separator).map(v => v.trim().replace(/"/g, ''))
    if (values.length < 2) continue // Need at least 2 columns

    const profile: ProfileData = {
      display_name: '',
      business_category: '',
      business_location: ''
    }

    // Map values to profile object using header mapping
    headers.forEach((header, index) => {
      const value = values[index] || ''
      const mappedField = headerMapping[header] || header.toLowerCase().replace(/\s+/g, '_')
      
      switch (mappedField) {
        case 'display_name':
          profile.display_name = value
          break
        case 'business_category':
          profile.business_category = value || 'General Business'
          break
        case 'address':
          profile.address = value
          break
        case 'location':
          // Split location into city and province if it contains comma
          if (value.includes(',')) {
            const parts = value.split(',').map(p => p.trim())
            profile.city = parts[0]
            profile.province = parts[1] || 'South Africa'
          } else {
            profile.city = value || 'Unknown'
            profile.province = 'South Africa'
          }
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
        case 'facebook_url':
          profile.facebook_url = value
          break
        default:
          // Handle any additional columns
          console.log(`🔍 Unmapped column: ${header} = ${value}`)
          break
      }
    })

    // Handle old format where city and province are separate
    if (profile.city && profile.province) {
      profile.business_location = generateLocationSlug(profile.city, profile.province)
    } else if (profile.city) {
      profile.business_location = generateLocationSlug(profile.city, 'South Africa')
    } else {
      profile.business_location = 'south-africa'
    }

    // Add default social media URLs if missing
    const businessSlug = profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    if (!profile.facebook_url) {
      profile.facebook_url = `https://facebook.com/${businessSlug}`
    }
    
    // Add default social media URLs
    profile.instagram_url = `https://instagram.com/${businessSlug}`
    profile.twitter_url = `https://twitter.com/${businessSlug}`
    profile.linkedin_url = `https://linkedin.com/company/${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

    // Debug logging
    console.log('🔍 Processing profile:', {
      display_name: profile.display_name,
      business_category: profile.business_category,
      city: profile.city,
      province: profile.province,
      business_location: profile.business_location,
      facebook_url: profile.facebook_url
    })

    // Only add if we have a display name (company name)
    if (profile.display_name && profile.display_name.trim()) {
      profiles.push(profile)
    } else {
      console.log('❌ Skipping profile due to missing company name:', profile)
    }
  }

  console.log(`✅ Parsed ${profiles.length} valid profiles from CSV`)
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

    // Required field validation - only display_name is truly required
    if (!profile.display_name?.trim()) {
      profileErrors.push('Company name is required')
    }

    // Set defaults for missing required fields
    if (!profile.business_category?.trim()) {
      profile.business_category = 'General Business'
    }

    if (!profile.business_location?.trim()) {
      profile.business_location = 'south-africa'
    }

    // Email validation (only if provided and not empty)
    if (profile.email && profile.email.trim() !== '' && !isValidEmail(profile.email)) {
      // Don't fail validation, just clear invalid email
      profile.email = ''
      errors.push(`Profile "${profile.display_name}": Invalid email format - will use auto-generated email`)
    }

    // Website URL validation (if provided) - fix invalid URLs
    if (profile.website_url && !isValidUrl(profile.website_url)) {
      // Try to fix the URL
      if (!profile.website_url.startsWith('http')) {
        profile.website_url = `https://${profile.website_url}`
      }
      // If still invalid, clear it
      if (!isValidUrl(profile.website_url)) {
        profile.website_url = ''
        errors.push(`Profile "${profile.display_name}": Invalid website URL - will use auto-generated URL`)
      }
    }

    // Always add to valid profiles if we have a display name
    if (profile.display_name?.trim()) {
      valid.push(profile)
    } else {
      errors.push(`Skipped profile: Missing company name`)
    }
  }

  console.log(`✅ Validation complete: ${valid.length} valid profiles, ${errors.length} warnings`)
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
