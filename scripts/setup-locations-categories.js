const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Starter locations data
const locations = [
  { city: 'All Locations', slug: 'all', province: 'National' },
  { city: 'Johannesburg', slug: 'johannesburg', province: 'Gauteng' },
  { city: 'Cape Town', slug: 'cape-town', province: 'Western Cape' },
  { city: 'Durban', slug: 'durban', province: 'KwaZulu-Natal' },
  { city: 'Pretoria', slug: 'pretoria', province: 'Gauteng' },
  { city: 'Pietermaritzburg', slug: 'pietermaritzburg', province: 'KwaZulu-Natal' },
  { city: 'Port Elizabeth', slug: 'port-elizabeth', province: 'Eastern Cape' },
  { city: 'Bloemfontein', slug: 'bloemfontein', province: 'Free State' },
  { city: 'East London', slug: 'east-london', province: 'Eastern Cape' },
  { city: 'Polokwane', slug: 'polokwane', province: 'Limpopo' },
  { city: 'Nelspruit', slug: 'nelspruit', province: 'Mpumalanga' },
  { city: 'Kimberley', slug: 'kimberley', province: 'Northern Cape' },
  { city: 'Rustenburg', slug: 'rustenburg', province: 'North West' }
]

// Starter categories data
const categories = [
  { name: 'All Categories', slug: 'all', description: 'Browse all business categories', icon: 'grid' },
  { name: 'Restaurants', slug: 'restaurants', description: 'Dining, cafes, food delivery, catering services', icon: 'utensils' },
  { name: 'Retail', slug: 'retail', description: 'Shopping, clothing, electronics, home goods', icon: 'shopping-bag' },
  { name: 'Services', slug: 'services', description: 'Professional services, consulting, repairs', icon: 'briefcase' },
  { name: 'Healthcare', slug: 'healthcare', description: 'Medical, dental, wellness, fitness centers', icon: 'heart' },
  { name: 'Technology', slug: 'technology', description: 'IT services, software, web development', icon: 'laptop' },
  { name: 'Construction', slug: 'construction', description: 'Building, renovation, contractors, architecture', icon: 'hammer' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness', description: 'Salons, spas, beauty treatments, wellness', icon: 'sparkles' },
  { name: 'Automotive', slug: 'automotive', description: 'Car sales, repairs, parts, automotive services', icon: 'car' },
  { name: 'Education', slug: 'education', description: 'Schools, training, tutoring, educational services', icon: 'graduation-cap' },
  { name: 'Finance', slug: 'finance', description: 'Banking, insurance, accounting, financial planning', icon: 'dollar-sign' },
  { name: 'Real Estate', slug: 'real-estate', description: 'Property sales, rentals, property management', icon: 'home' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Events, venues, entertainment services', icon: 'music' },
  { name: 'Travel & Tourism', slug: 'travel-tourism', description: 'Hotels, travel agencies, tour operators', icon: 'plane' },
  { name: 'Legal', slug: 'legal', description: 'Law firms, legal services, attorneys', icon: 'scale' }
]

async function setupLocationsAndCategories() {
  try {
    console.log('🚀 Setting up locations and categories...')
    
    // Check if tables exist by trying to select from them
    console.log('📍 Setting up locations...')
    
    // Try to insert locations
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .upsert(locations, { 
        onConflict: 'slug',
        ignoreDuplicates: true 
      })
      .select()
    
    if (locationError) {
      console.error('❌ Error inserting locations:', locationError)
      console.log('This might mean the locations table doesn\'t exist yet.')
      console.log('Please run the SQL migration first or create the tables manually.')
    } else {
      console.log(`✅ Successfully set up ${locations.length} locations`)
    }
    
    console.log('\n🏷️ Setting up categories...')
    
    // Try to insert categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(categories, { 
        onConflict: 'slug',
        ignoreDuplicates: true 
      })
      .select()
    
    if (categoryError) {
      console.error('❌ Error inserting categories:', categoryError)
      console.log('This might mean the categories table doesn\'t exist yet.')
      console.log('Please run the SQL migration first or create the tables manually.')
    } else {
      console.log(`✅ Successfully set up ${categories.length} categories`)
    }
    
    // Verify the data
    console.log('\n🔍 Verifying setup...')
    
    const { data: locCheck, error: locCheckError } = await supabase
      .from('locations')
      .select('city, slug')
      .limit(5)
    
    if (!locCheckError && locCheck) {
      console.log(`✅ Locations table working - found ${locCheck.length} entries`)
      locCheck.forEach(loc => console.log(`   - ${loc.city} (${loc.slug})`))
    }
    
    const { data: catCheck, error: catCheckError } = await supabase
      .from('categories')
      .select('name, slug')
      .limit(5)
    
    if (!catCheckError && catCheck) {
      console.log(`✅ Categories table working - found ${catCheck.length} entries`)
      catCheck.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`))
    }
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Your homepage will now fetch locations and categories from the database')
    console.log('2. Update your profile forms to use these reference tables')
    console.log('3. Consider adding foreign key relationships to the profiles table')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n💡 If tables don\'t exist, you may need to create them first.')
    console.log('Check your Supabase dashboard or run the SQL migration.')
  }
}

// Run the setup
setupLocationsAndCategories()
