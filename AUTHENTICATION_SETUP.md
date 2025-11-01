# Authentication Setup Guide

This guide explains how to set up authentication for the A2Z Business Directory application.

## 🔧 Supabase Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dcfgdlwhixdruyewywly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Database Schema

The application uses a `profiles` table that extends Supabase's built-in authentication:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  website_url TEXT,
  business_category TEXT,
  business_location TEXT,
  business_hours TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  verified_seller BOOLEAN DEFAULT false,
  early_adopter BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  current_listings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

### Row Level Security (RLS)

The profiles table has RLS enabled with the following policies:

```sql
-- Allow users to view all profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Trigger Function

A trigger automatically creates a profile when a user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    subscription_tier,
    subscription_status,
    early_adopter,
    verified_seller,
    is_active,
    current_listings
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free'),
    'active',
    false,
    false,
    true,
    0
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Demo User Setup

### Automatic Setup
Use the demo user creation tool at `/public/create-demo-user.html`:

1. Open `http://localhost:3000/create-demo-user.html`
2. Click "Create Demo User"
3. Test login with the created credentials

### Manual Setup
If automatic creation fails:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `demo@a2zbusiness.com`
4. Password: `demo123456`
5. Check "Confirm email"
6. Click "Create user"

### Demo Credentials
```
Email: demo@a2zbusiness.com
Password: demo123456
```

## 🔐 Authentication Flow

### Sign Up Process
1. User fills out signup form at `/auth/signup-animated`
2. Supabase creates user in `auth.users` table
3. Trigger function creates corresponding profile in `profiles` table
4. User is redirected to dashboard

### Sign In Process
1. User enters credentials at `/auth/login-animated`
2. Supabase validates credentials
3. User is redirected to dashboard
4. Profile data is loaded from `profiles` table

### Protected Routes
Routes are protected using the `useAuth` hook:

```tsx
const { user, loading } = useAuth()

useEffect(() => {
  if (!loading && !user) {
    router.push('/auth/login-animated')
  }
}, [user, loading])
```

## 🛠 Troubleshooting

### Common Issues

1. **Trigger Function Errors**
   - Check if the trigger function exists
   - Verify RLS policies are correct
   - Use the reset script: `scripts/reset-policies.sql`

2. **Profile Not Created**
   - Manually create profile in Supabase dashboard
   - Check trigger function logs
   - Verify user has correct permissions

3. **Login Issues**
   - Confirm user email is verified
   - Check if user exists in auth.users table
   - Verify environment variables are correct

### Reset Authentication
If you need to reset the authentication system:

1. Run `scripts/reset-policies.sql` in Supabase SQL editor
2. Recreate demo user using the HTML tool
3. Test login functionality

## 📝 Development Notes

- The app uses business profiles only (no personal profiles)
- Subscription tiers: free, premium, business
- Profile type is always set to 'business'
- Early adopter status can be manually set in database

## 🔗 Related Files

- `/lib/auth.tsx` - Authentication context and hooks
- `/lib/supabaseClient.ts` - Supabase client configuration
- `/app/auth/login-animated/page.tsx` - Login page
- `/app/auth/signup-animated/page.tsx` - Signup page
- `/app/profile/page.tsx` - Profile management
- `/scripts/reset-policies.sql` - Database reset script
