import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key for auth operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDUyNTU2NiwiZXhwIjoyMDc2MTAxNTY2fQ.m96uClWOYZTspFko_ofQ2Q_Euf4gze0',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      )
    }

    console.log(`🔑 Admin impersonation request for user: ${userId} (${userName})`)

    // Verify the user exists in the database
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, email, is_active')
      .eq('id', userId)
      .single()

    if (userError || !userProfile) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userProfile.is_active) {
      return NextResponse.json(
        { error: 'Cannot login as inactive user' },
        { status: 400 }
      )
    }

    // Check if user has authentication record
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUser.user) {
      console.log('⚠️ User has no auth record, need to create one first...')
      
      // For users without auth, create a temporary auth account
      const tempEmail = userProfile.email || `${userProfile.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@temp.a2zsellr.life`
      const tempPassword = '123456' // Default password
      
      try {
        console.log(`🔐 Creating temporary auth for user: ${tempEmail}`)
        
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: tempEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            display_name: userProfile.display_name,
            temp_account: true,
            original_user_id: userId
          }
        })

        if (createError) {
          console.error('❌ Failed to create temp auth:', createError)
          return NextResponse.json(
            { error: 'Failed to create temporary authentication' },
            { status: 500 }
          )
        }

        // Update the profile to use the new auth user ID
        await supabaseAdmin
          .from('profiles')
          .update({ id: newAuthUser.user!.id })
          .eq('id', userId)

        // Use impersonation instead of magic links to avoid Supabase URL config issues
        console.log('✅ Using impersonation for temporary auth user')

        const response = NextResponse.json({
          success: true,
          message: 'Temporary authentication created with impersonation',
          userProfile: userProfile,
          method: 'admin_impersonation',
          tempCredentials: { email: tempEmail, password: tempPassword }
        })

        // Set impersonation cookies
        console.log('🍪 Setting impersonation cookies for temp auth user:', { userId: newAuthUser.user!.id, userName })
        
        response.cookies.set('admin_impersonating', newAuthUser.user!.id, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 2 // 2 hours
        })

        response.cookies.set('impersonated_user_name', encodeURIComponent(userName), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 2 // 2 hours
        })

        return response

      } catch (error) {
        console.error('❌ Error creating temp auth:', error)
        return NextResponse.json(
          { error: 'Failed to create temporary authentication' },
          { status: 500 }
        )
      }
    }

    // For users with existing auth records, generate magic link
    console.log('✅ User has auth record, generating magic link')

    // Skip magic links and use impersonation for all users to avoid Supabase URL config issues
    console.log('✅ Using impersonation method to avoid Supabase URL configuration issues')

    const response = NextResponse.json({
      success: true,
      message: 'User impersonation session created',
      userProfile: userProfile,
      method: 'admin_impersonation'
    })

    // Set impersonation cookies
    console.log('🍪 Setting impersonation cookies for authenticated user:', { userId, userName })
    
    response.cookies.set('admin_impersonating', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2 // 2 hours
    })

    response.cookies.set('impersonated_user_name', encodeURIComponent(userName), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2 // 2 hours
    })

    return response

  } catch (error) {
    console.error('❌ Admin login-as-user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}