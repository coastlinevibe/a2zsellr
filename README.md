# A2Z Business Directory

South Africa's Premium Business Directory - A modern, mobile-first platform for discovering and managing business listings with powerful e-commerce and marketing tools.

## 🚀 Features

### 🏢 Business Profiles & Tiers
- **Free Tier**: Complete profile with 3 gallery images, 5 products, 3 shared listings, 5-minute reset (testing)
- **Premium Tier**: Unlimited gallery, full e-commerce, WhatsApp & Facebook marketing, Google Maps
- **Business Tier**: 12 gallery images, multi-location management, Instagram automation, advanced analytics, custom branding

### �️ Ev-Commerce & Shopping
- **Shopping Cart System**: Full cart management with persistent storage
- **Product Management**: Unlimited products for Premium/Business tiers, 5 for Free tier
- **Order Management**: Complete order lifecycle tracking (pending → confirmed → processing → shipped → delivered)
- **Payment Processing**: PayFast integration for secure payments, EFT payment option
- **Order Items**: Detailed order items with variants (size, color, custom options)
- **Shipping Integration**: Address validation, city/province selection, postal code tracking

### 🔍 Advanced Search & Discovery
- **Real-time Search**: Search across business names, categories, locations, and descriptions
- **Dynamic Filtering**: Filter by 15+ business categories and 13+ South African cities
- **Verified Seller Priority**: Verified businesses ranked higher in search results
- **Success Ticker**: Live feed of recent product additions and business activity
- **Business Card Display**: Rich business cards with ratings, reviews, and quick actions

### 📱 Mobile-First Design
- **Responsive Interface**: Optimized for all devices (mobile, tablet, desktop)
- **Brutalist UI**: Bold, high-contrast design with strong typography
- **Touch-Friendly**: Optimized controls and navigation for mobile users
- **Fast Loading**: Optimized queries and lazy loading

### 📊 Marketing & Analytics
- **WhatsApp Marketing**: Ad scheduling and automation tools
- **Facebook Campaigns**: Campaign creation and management tools
- **Instagram Automation**: Cross-platform campaign automation (Business tier)
- **Marketing Analytics**: Track campaign performance and ROI
- **Campaign Dashboard**: Centralized campaign management interface

### 🗺️ Location & Mapping
- **Google Maps Integration**: Interactive maps for Premium/Business tiers
- **Location Management**: Support for all South African provinces and cities
- **Multi-Location Support**: Manage multiple business locations (Business tier)
- **Location Auto-Creation**: Automatic location creation during bulk uploads

### 👥 User Management & Admin
- **Admin Dashboard**: Comprehensive admin interface for system management
- **User Management**: View, filter, and manage all users by subscription tier
- **Category Management**: Create and manage business categories
- **Location Management**: Manage cities and provinces
- **Bulk Upload System**: Upload hundreds of profiles at once with default products
- **Reset System**: Automated 5-minute reset for free tier users (testing mode)
- **Payment Dashboard**: Track all payment transactions and subscriptions

### 🎯 Bulk Upload System
- **CSV Import**: Upload up to 300 profiles per batch
- **Auto-Location Creation**: Automatically creates missing locations
- **Default Products**: Assigns 10 category-specific products per profile
- **Duplicate Detection**: Removes duplicate profiles automatically
- **Error Reporting**: Detailed error logs for failed uploads
- **Category-Based Products**: Butcher shops, restaurants, bakeries, grocery stores, etc.

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Styling**: Tailwind CSS with custom utilities
- **UI Components**: Radix UI primitives, Lucide React icons
- **Animations**: Framer Motion for smooth transitions
- **Authentication**: Supabase Auth with email/password
- **Payment**: PayFast integration for subscriptions
- **Maps**: Google Maps API integration
- **State Management**: React Context (Auth, Cart, Notifications)

## 📁 Project Structure

```
a2z/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Homepage with search & directory
│   ├── layout.tsx                    # Root layout with providers
│   ├── globals.css                   # Global styles
│   ├── auth/
│   │   └── signup-animated/          # Animated signup flow
│   ├── dashboard/
│   │   ├── page.tsx                  # User dashboard
│   │   └── shop/                     # Shop management
│   ├── profile/
│   │   ├── page.tsx                  # Profile redirect
│   │   └── [username]/               # Dynamic profile pages
│   │       ├── free/                 # Free tier profile view
│   │       ├── premium/              # Premium tier profile view
│   │       └── business/             # Business tier profile view
│   ├── admin/                        # Admin dashboard
│   ├── checkout/                     # Checkout flow
│   ├── orders/                       # Order management
│   ├── payment/                      # Payment processing
│   ├── settings/                     # User settings
│   ├── referrals/                    # Referral system
│   ├── support/                      # Support pages
│   ├── api/
│   │   ├── admin/                    # Admin API endpoints
│   │   ├── payfast/                  # PayFast webhooks
│   │   ├── public-listings/          # Public listing endpoints
│   │   ├── track-view/               # Analytics tracking
│   │   ├── templates/                # Template management
│   │   └── n8n/                      # Automation webhooks
│   └── [username]/                   # Public profile routes
├── components/                       # Reusable React components
│   ├── ui/                           # UI primitives
│   ├── dashboard/                    # Dashboard components
│   ├── providers/                    # Context providers
│   ├── BusinessCard.tsx              # Business listing card
│   ├── ShoppingCart.tsx              # Shopping cart component
│   ├── PaymentModal.tsx              # Payment processing modal
│   ├── PlanSelectionModal.tsx        # Subscription plan selector
│   ├── BulkUploadManager.tsx         # Bulk upload interface
│   ├── AdminLoginModal.tsx           # Admin authentication
│   ├── AdminPaymentDashboard.tsx     # Payment tracking
│   ├── AdminCategoriesLocations.tsx  # Category/location management
│   ├── CampaignDashboard.tsx         # Marketing campaigns
│   ├── MarketingAnalytics.tsx        # Analytics dashboard
│   ├── ProfileCompletenessIndicator.tsx # Profile completion tracker
│   ├── ResetCountdownBanner.tsx      # Free tier reset timer
│   ├── GoogleMapDisplay.tsx          # Map display component
│   ├── GoogleMapPicker.tsx           # Map location picker
│   └── [40+ more components]         # Additional UI components
├── lib/                              # Utility functions & services
│   ├── supabaseClient.ts             # Supabase client initialization
│   ├── auth.tsx                      # Authentication context & hooks
│   ├── subscription.ts               # Subscription management
│   ├── orderService.ts               # Order creation & management
│   ├── resetSystem.ts                # Free tier reset automation
│   ├── bulkUploadUtils.ts            # Bulk upload processing
│   ├── defaultProducts.ts            # Category-specific products
│   ├── googleMapsUtils.ts            # Google Maps utilities
│   ├── uploadUtils.ts                # File upload utilities
│   ├── performanceOptimizations.ts   # Performance utilities
│   └── [15+ more utilities]          # Additional helpers
├── hooks/                            # Custom React hooks
│   └── useCustomPopup.tsx            # Custom popup hook
├── contexts/                         # React Context providers
│   ├── CartContext.tsx               # Shopping cart state
│   └── NotificationContext.tsx       # Notification system
├── types/                            # TypeScript type definitions
│   └── google-maps.d.ts              # Google Maps types
├── supabase/                         # Supabase configuration
│   ├── migrations/                   # Database migrations
│   └── functions/                    # Edge functions
├── scripts/                          # Utility scripts
├── sql/                              # SQL queries & schemas
├── tailwind.config.js                # Tailwind CSS configuration
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── .env.example                      # Environment variables template
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User business profiles with subscription tiers, verification status, analytics
- **profile_products**: Products/services offered by businesses
- **profile_gallery**: Gallery images for business profiles
- **profile_listings**: Marketing listings and shared content
- **locations**: South African cities and provinces
- **categories**: Business categories with descriptions
- **orders**: Customer orders with payment tracking
- **order_items**: Individual items within orders
- **payment_transactions**: Payment history and subscription tracking
- **reset_history**: Tracking of free tier resets

### Key Features
- **Row Level Security (RLS)**: Policies for data access control
- **Automatic Timestamps**: created_at, updated_at on all tables
- **Foreign Keys**: Referential integrity across tables
- **Indexes**: Optimized queries for search and filtering
- **Soft Deletes**: is_active flags for data retention

## � Geteting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account with PostgreSQL database
- Google Maps API key (for Premium/Business features)
- PayFast merchant account (for payments)

### Installation

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

   # PayFast
   NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_merchant_id
   NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_merchant_key
   PAYFAST_PASSPHRASE=your_passphrase

   # Application
   NEXT_PUBLIC_APP_URL=https://www.a2zsellr.life
   CRON_SECRET_TOKEN=your_secret_token
   ```

3. **Run database migrations**:
   ```bash
   node scripts/setup-locations-categories.js
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `https://www.a2zsellr.life`

## 📊 Business Tiers

### Free Tier (R0/month)
- **Profile Features**:
  - Complete business profile with validation
  - 3 gallery images (strict limit)
  - 5 products in shop (display only)
  - Contact information and basic location
  - 3 shared marketing listings
  - Gallery layouts: horizontal slider, vertical slider, hover effects
  
- **Restrictions**:
  - No sharing on Wednesday, Saturday, Sunday
  - 5-minute automatic reset (products & listings cleared) - TESTING MODE
  - No e-commerce checkout
  - No Google Maps integration
  - No marketing tools
  
- **Use Case**: Businesses testing the platform, local service providers

### Premium Tier (R149/month)
- **All Free Tier features** without restrictions
- **E-Commerce**:
  - Unlimited products and 12 gallery images
  - Full shopping cart and checkout
  - PayFast payment processing
  - Order management and tracking
  
- **Marketing**:
  - WhatsApp ad scheduling and automation
  - Facebook campaign tools and analytics
  - Premium directory placement
  - Search priority and featured listings
  
- **Features**:
  - Google Maps integration
  - No automatic resets
  - No sharing day restrictions
  - Enhanced analytics
  
- **Use Case**: Active businesses selling online, restaurants, retail shops

### Business Tier (R299/month)
- **Everything in Premium** plus:
- **Advanced Management**:
  - Multi-location management with centralized dashboard
  - Bulk product management
  - Advanced analytics with predictive insights
  
- **Marketing Automation**:
  - Instagram ad automation
  - Cross-platform campaign management
  - Custom branding and white-label options
  - Priority support with dedicated agents
  
- **Enterprise Features**:
  - API access for third-party integrations
  - Bulk upload system (300+ profiles)
  - Custom reporting
  - SLA guarantees
  
- **Use Case**: Enterprise businesses, franchises, multi-location operations

## 🔧 Development

### Key Commands
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Management
- **Supabase Dashboard**: Manual operations at https://app.supabase.com
- **Migrations**: Run scripts in `/scripts/` directory
- **Schema Changes**: Check `/supabase/migrations/` for version history

### Admin Features
- **Admin Dashboard**: Access at `/admin` (requires admin credentials)
- **User Management**: View and manage all users
- **Category Management**: Create and edit business categories
- **Location Management**: Manage cities and provinces
- **Bulk Upload**: Upload CSV files with business profiles
- **Reset System**: Trigger manual resets for free tier users (5-minute intervals)
- **Payment Dashboard**: Track all transactions

### API Endpoints
- `POST /api/admin/bulk-upload` - Upload CSV profiles
- `POST /api/payfast/webhook` - PayFast payment webhook
- `GET /api/public-listings` - Get public business listings
- `POST /api/track-view` - Track profile views
- `POST /api/templates/*` - Template management
- `POST /api/orders/create` - Create orders (bypasses RLS)
- `POST /api/admin/setup-rls` - Configure RLS policies

## 🎯 Core Features Deep Dive

### Shopping Cart System
- **Persistent Storage**: Cart saved in browser localStorage
- **Multi-Business**: Add items from multiple businesses
- **Variants**: Support for size, color, and custom options
- **Real-time Updates**: Instant price calculations and totals
- **Checkout Flow**: Streamlined checkout with address validation

### Order Management
- **Order Lifecycle**: pending → confirmed → processing → shipped → delivered
- **Order Tracking**: Real-time status updates and tracking numbers
- **Payment Integration**: Automatic payment status updates
- **Order History**: Complete order history for customers and businesses
- **Invoice Generation**: Automatic invoice creation

### Marketing Tools
- **Campaign Creation**: Create and schedule marketing campaigns
- **Multi-Channel**: WhatsApp, Facebook, Instagram integration
- **Analytics**: Track campaign performance and ROI
- **Automation**: Scheduled posting and automated responses
- **A/B Testing**: Test different campaign variations

### Bulk Upload System
- **CSV Format**: Standard CSV with required columns
- **Auto-Location**: Automatically creates missing locations
- **Default Products**: 10 category-specific products per profile
- **Duplicate Detection**: Removes duplicate profiles
- **Error Handling**: Detailed error reports for failed uploads
- **Progress Tracking**: Real-time upload progress

### Free Tier Reset System (TESTING MODE)
- **Automatic Reset**: Every 5 minutes for free tier users (for testing)
- **Reset Scope**: Clears products, listings, gallery, and analytics
- **Auto-Extension**: Trial automatically extended by 5 minutes after reset
- **Real-time Timer**: Updates every second showing minutes and seconds
- **Notifications**: Users notified before reset
- **Reset History**: Track all resets for audit purposes
- **Manual Override**: Admin can trigger manual resets

## 🌟 Recent Updates & Enhancements

### Frontend Improvements
- **Brutalist Design**: Bold, high-contrast UI with strong typography
- **Framer Motion Animations**: Smooth transitions and interactive elements
- **Success Ticker**: Live feed of recent business activity
- **Exit Intent Modal**: Capture users about to leave
- **Responsive Grid**: Dynamic business card grid layout
- **Mobile Optimization**: Touch-friendly controls and navigation

### Backend Enhancements
- **Order Service**: Complete order creation and management via API endpoint
- **Payment Integration**: PayFast and EFT payment options with proper RLS handling
- **Bulk Upload**: CSV import with auto-location creation
- **Reset Automation**: Scheduled 5-minute resets for free tier (testing mode)
- **Analytics Tracking**: View tracking and engagement metrics
- **Admin Dashboard**: Comprehensive system management

### Database Improvements
- **RLS Policies**: Enhanced security with row-level security for orders/order_items
- **Order Number Generation**: Auto-generated order numbers with database trigger
- **Order Item Totals**: Auto-calculated total_price_cents from unit_price * quantity
- **Optimized Indexes**: Faster search and filtering on profiles, orders, order_items
- **Audit Logging**: Track all important actions
- **Data Validation**: Constraints and triggers for data integrity
- **Backup System**: Automated backups and recovery

### Checkout & Payment Fixes (Latest)
- **Order Creation API**: New `/api/orders/create` endpoint using service role to bypass RLS
- **Order Number Auto-Generation**: Database trigger generates unique order numbers
- **Order Item Total Calculation**: Trigger auto-calculates total_price_cents if not provided
- **Proper Field Mapping**: Corrected field names to match actual database schema
- **Error Handling**: Improved error messages for debugging
- **Multi-Business Checkout**: Support for orders from multiple businesses in single checkout

### Database Schema Cleanup
- **Profiles Table Optimization**: Removed 14 unused columns (40% bloat reduction)
- **Removed Columns**: business_hours, subscription dates, location_id, category_id, payment fields, address
- **Added Analytics**: rating, total_reviews, total_sales, total_revenue_cents, last_activity_at
- **Improved Indexes**: Added indexes on subscription_tier, business_category, business_location, verified_seller

## 🚀 Development Roadmap

### Phase 1: Foundation (Completed)
- ✅ User authentication and profiles
- ✅ Business directory with search
- ✅ Free tier with restrictions
- ✅ Basic gallery and products

### Phase 2: E-Commerce (Completed)
- ✅ Shopping cart system
- ✅ Order management with RLS
- ✅ PayFast integration
- ✅ Checkout flow with multi-business support
- ✅ Order number auto-generation
- ✅ Order item total calculation
- ✅ Inventory management
- ✅ Shipping integration

### Phase 3: Marketing (In Progress)
- ✅ WhatsApp marketing tools
- ✅ Facebook campaign tools
- ✅ Campaign dashboard
- 🔄 Instagram automation
- 🔄 Analytics dashboard

### Phase 4: Enterprise (Planned)
- 📋 Multi-location management
- 📋 Advanced analytics
- 📋 API access
- 📋 Custom branding
- 📋 Priority support

## 📋 Recent Fixes & Improvements (November 2025)

### Checkout System Fixes
- Fixed RLS policy errors preventing order creation
- Implemented service role API endpoint for secure order creation
- Auto-generated order numbers with database triggers
- Auto-calculated order item totals
- Improved error handling and logging

### Database Optimization
- Removed 14 unused columns from profiles table (40% bloat reduction)
- Added analytics columns for business metrics
- Optimized indexes for faster queries
- Enhanced RLS policies for better security

### Documentation
- Created comprehensive implementation guide
- Added database migration scripts
- Documented all API endpoints
- Added troubleshooting guide

## 🌟 Future Features

- **Multi-Language Support**: Afrikaans, Zulu, Xhosa translations
- **Mobile App**: React Native iOS/Android app
- **AI Features**: Business insights, recommendations, chatbot
- **Marketplace**: Integrated marketplace for services
- **Voice Search**: Voice-based search capability
- **Video Support**: Product videos and business tours
- **Live Chat**: Real-time customer support
- **Loyalty Program**: Customer rewards and referrals

## 📝 License
This project is proprietary software for A2Z Business Directory.

---

Built with ❤️ for South African businesses

## 🎯 Key Success Metrics

- **Free Tier**: Complete profiles in <5 minutes, drive customer inquiries
- **Premium Tier**: Generate direct sales, measurable marketing ROI
- **Business Tier**: Enterprise-level management, data-driven growth
- **Platform**: 1,000+ active businesses, 10,000+ monthly visitors

---

**A2Z Business Directory** - From discovery to purchase to growth, all in one platform.