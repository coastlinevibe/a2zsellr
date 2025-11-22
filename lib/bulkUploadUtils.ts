// Bulk upload utilities for CSV parsing and validation

interface ProfileData {
  display_name: string
  address?: string
  city?: string
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
 * Standard Format: business_category display_name address business_location website_url phone_number email facebook
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
  console.log('📋 Standard format: business_category display_name address business_location website_url phone_number email facebook')
  
  // Check if this matches the standard format
  const isStandardFormat = headers.length >= 7 && 
    (headers.includes('business_category') || headers.includes('display_name') || 
     headers.includes('address') || headers.includes('business_location'))
  
  console.log('📋 Is standard format:', isStandardFormat)

  // Parse data rows
  const profiles: ProfileData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines
    
    // Split the line and handle quoted values properly
    const values = parseCSVLine(line, separator)
    
    if (values.length < 2) continue // Need at least 2 columns

    const profile: ProfileData = {
      display_name: '',
      business_category: '',
      business_location: ''
    }

    console.log(`🔍 Row ${i}: Processing ${values.length} values`)
    console.log(`🔍 Raw values:`, values)
    console.log(`🔍 Raw line:`, line)

    // Use positional mapping for the standard format:
    // 0: business_category, 1: display_name, 2: address, 3: business_location, 4: website_url, 5: phone_number, 6: email, 7: facebook
    
    if (isStandardFormat) {
      // Clean and assign values by position
      const cleanValue = (val: string) => {
        if (!val) return ''
        val = val.trim()
        return (val.toLowerCase() === 'demo-data' || val.toLowerCase() === 'demo data') ? '' : val
      }

      profile.business_category = cleanValue(values[0]) || 'general-business'
      profile.display_name = cleanValue(values[1])
      profile.address = cleanValue(values[2])
      
      // Business location (use as-is, it should be a location slug like "johannesburg-gauteng")
      const rawBusinessLocation = values[3]
      const businessLocation = cleanValue(rawBusinessLocation)
      profile.business_location = businessLocation || 'south-africa'
      
      console.log(`🔍 Business location processing for ${profile.display_name}:`, {
        totalValues: values.length,
        rawValue: rawBusinessLocation,
        cleanedValue: businessLocation,
        finalBusinessLocation: profile.business_location,
        allValues: values
      })
      
      // Extract city from business_location if possible (no province needed)
      if (businessLocation && businessLocation.includes('-')) {
        const parts = businessLocation.split('-')
        profile.city = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      } else if (businessLocation) {
        profile.city = businessLocation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      
      profile.website_url = cleanValue(values[4])
      profile.phone_number = cleanValue(values[5])
      profile.email = cleanValue(values[6])
      profile.facebook_url = cleanValue(values[7])
      
      console.log(`🔍 Mapped profile:`, {
        business_category: profile.business_category,
        display_name: profile.display_name,
        address: profile.address,
        business_location: profile.business_location,
        city: profile.city,
        website_url: profile.website_url,
        phone_number: profile.phone_number,
        email: profile.email,
        facebook_url: profile.facebook_url
      })
    } else {
      // Fallback to header-based mapping for other formats
      headers.forEach((header, index) => {
        let value = values[index] || ''
        
        // Treat "demo-data" as empty/missing value
        if (value.toLowerCase() === 'demo-data' || value.toLowerCase() === 'demo data') {
          value = ''
        }
        
        const headerMapping: { [key: string]: string } = {
          'display_name': 'display_name',
          'address': 'address', 
          'city': 'city',
          'business_location': 'business_location',
          'website_url': 'website_url',
          'phone_number': 'phone_number',
          'email': 'email',
          'business_category': 'business_category'
        }
        
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
          case 'city':
            profile.city = value
            break
          case 'business_location':
            profile.business_location = value
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
        }
      })
    }

    // Handle old format where city is separate (no province needed)
    if (profile.city && !profile.business_location) {
      profile.business_location = generateLocationSlug(profile.city)
    } else if (!profile.business_location) {
      profile.business_location = 'south-africa'
    }

    // Add default social media URLs if missing or demo-data
    const businessSlug = profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Only set Facebook URL if it's missing or was demo-data
    if (!profile.facebook_url || profile.facebook_url.trim() === '') {
      profile.facebook_url = `https://facebook.com/${businessSlug}`
    }
    
    // Add default social media URLs (always generate these)
    profile.instagram_url = `https://instagram.com/${businessSlug}`
    profile.twitter_url = `https://twitter.com/${businessSlug}`
    profile.linkedin_url = `https://linkedin.com/company/${profile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

    // Debug logging
    console.log('🔍 Processing profile:', {
      display_name: profile.display_name,
      business_category: profile.business_category,
      city: profile.city,
      business_location: profile.business_location,
      facebook_url: profile.facebook_url,
      email: profile.email,
      phone_number: profile.phone_number,
      website_url: profile.website_url
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

/**
 * Parse a CSV line handling quoted values and separators properly
 */
function parseCSVLine(line: string, separator: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === separator && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last value
  values.push(current.trim())
  
  return values
}
