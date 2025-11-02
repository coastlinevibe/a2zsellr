# A2Z Business Directory - Data Models & Schema

This document outlines the complete data model structure for the A2Z Business Directory application.

## 📊 **Database Schema Overview**

### **Core Tables**

#### 1. **Profiles Table** (Main User Profiles)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  website_url TEXT,
  business_category TEXT,
  business_location TEXT,
  business_hours TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'business')),
  subscription_status TEXT DEFAULT 'active',
  verified_seller BOOLEAN DEFAULT false,
  early_adopter BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  current_listings INTEGER DEFAULT 0,
  location_id INTEGER REFERENCES public.locations(id),
  category_id INTEGER REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **Locations Table** (South African Cities)
```sql
CREATE TABLE public.locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'South Africa',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **Categories Table** (Directory Categories)
```sql
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🏢 **Profile Model**

### **TypeScript Interface**
```typescript
export interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  business_category: string | null
  business_location: string | null
  business_hours: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: string | null
  verified_seller: boolean
  early_adopter: boolean
  is_active: boolean
  current_listings: number
  location_id?: number
  category_id?: number
  created_at: string
  updated_at: string
}
```

### **Profile Tiers & Features**

#### **Free Tier (R0/month)**
```typescript
const FREE_TIER_FEATURES = {
  gallery_images: 3,
  shop_products: 5,
  marketing_listings: 3,
  features: [
    'Basic business profile',
    'Contact information',
    'Location mapping',
    'Customer reviews',
    'Basic search visibility'
  ]
}
```

#### **Premium Tier (R149/month)**
```typescript
const PREMIUM_TIER_FEATURES = {
  gallery_images: 'unlimited',
  shop_products: 'unlimited',
  marketing_listings: 'unlimited',
  features: [
    'Everything in Free',
    'Gallery slider showcase',
    'WhatsApp ad scheduling',
    'Facebook campaign tools',
    'Premium directory placement',
    'Advanced analytics'
  ]
}
```

#### **Business Tier (R299/month)**
```typescript
const BUSINESS_TIER_FEATURES = {
  gallery_images: 'unlimited',
  shop_products: 'unlimited',
  marketing_listings: 'unlimited',
  features: [
    'Everything in Premium',
    'Multi-location management',
    'Instagram ad automation',
    'Custom branding options',
    'Priority support',
    'Advanced analytics dashboard',
    'API access'
  ]
}
```

## 📍 **Directory Location Model**

### **Supported South African Cities**
```typescript
export interface Location {
  id: number
  city: string
  slug: string
  province: string
  country: string
  is_active: boolean
}

const SUPPORTED_LOCATIONS = [
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
```

## 🏷️ **Category Model**

### **Directory Categories**
```typescript
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  is_active: boolean
}

const CATEGORIES = [
  { name: 'All Categories', slug: 'all', icon: 'grid' },
  { name: 'Restaurants', slug: 'restaurants', icon: 'utensils' },
  { name: 'Retail', slug: 'retail', icon: 'shopping-bag' },
  { name: 'Services', slug: 'services', icon: 'briefcase' },
  { name: 'Healthcare', slug: 'healthcare', icon: 'heart' },
  { name: 'Technology', slug: 'technology', icon: 'laptop' },
  { name: 'Construction', slug: 'construction', icon: 'hammer' },
  { name: 'Beauty & Wellness', slug: 'beauty-wellness', icon: 'sparkles' },
  { name: 'Automotive', slug: 'automotive', icon: 'car' },
  { name: 'Education', slug: 'education', icon: 'graduation-cap' },
  { name: 'Finance', slug: 'finance', icon: 'dollar-sign' },
  { name: 'Real Estate', slug: 'real-estate', icon: 'home' },
  { name: 'Entertainment', slug: 'entertainment', icon: 'music' },
  { name: 'Travel & Tourism', slug: 'travel-tourism', icon: 'plane' },
  { name: 'Legal', slug: 'legal', icon: 'scale' }
]
```

## 💰 **Subscription Model**

### **Pricing Structure**
```typescript
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

const TIER_PRICING = {
  free: 0,
  premium: 149,
  business: 299
}


## 🔐 **Authentication Model**

### **User Authentication Flow**
```typescript
// Supabase Auth User extends to Profile
interface AuthUser {
  id: string
  email: string
  user_metadata: {
    display_name?: string
    selected_plan?: string
  }
  created_at: string
}

// Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, display_name, email, subscription_tier, 
    subscription_status, early_adopter, verified_seller, 
    is_active, current_listings
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free'),
    'active', false, false, true, 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔍 **Search & Filter Model**

### **Search Parameters**
```typescript
interface SearchFilters {
  query?: string           // Text search across name, bio, category, location
  category?: string        // Category slug filter
  location?: string        // Location slug filter
  subscription_tier?: string // Tier filter
  verified_only?: boolean  // Show only verified sellers
  sort_by?: 'recent' | 'rating' | 'verified' | 'tier'
  limit?: number          // Results per page
  offset?: number         // Pagination offset
}

interface SearchResult {
  profiles: UserProfile[]
  total_count: number
  has_more: boolean
  filters_applied: SearchFilters
}
```

## 📊 **Analytics Model**

### **Business Metrics**
```typescript
interface BusinessMetrics {
  profile_views: number
  total_clicks: number
  monthly_views: number
  rating: number
  review_count: number
  listing_performance: {
    active_listings: number
    total_impressions: number
    click_through_rate: number
  }
}
```

## 🔗 **Relationships**

### **Database Relationships**
- `profiles.id` → `auth.users.id` (One-to-One)
- `profiles.location_id` → `locations.id` (Many-to-One)
- `profiles.category_id` → `categories.id` (Many-to-One)

### **Business Logic Relationships**
- **Subscription Tier** determines feature access
- **Verified Seller** status affects search ranking
- **Early Adopter** status provides pricing discounts
- **Location & Category** enable filtered discovery

## 🛡️ **Security Model**

### **Row Level Security (RLS)**
```sql
-- Profiles: Users can view all, but only edit their own
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Locations & Categories: Read-only for all users
CREATE POLICY "locations_select_all" ON public.locations FOR SELECT USING (true);
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
```

## 📱 **API Endpoints**

### **Profile Management**
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profiles` - Search business profiles

### **Directory**
- `GET /api/locations` - Get all locations
- `GET /api/categories` - Get all categories
- `GET /api/search` - Search businesses with filters

### **Subscription**
- `GET /api/subscription` - Get user subscription
- `POST /api/subscription/upgrade` - Upgrade subscription
- `POST /api/subscription/cancel` - Cancel subscription

---

This data model supports a scalable, feature-rich business directory with clear separation of concerns and robust search capabilities.
