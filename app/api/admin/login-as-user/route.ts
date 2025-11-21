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
      console.log('⚠️ User has no auth record, creating temporary session...')
      
      // For users without email/auth (like bulk uploaded users), 
      // we'll create a temporary admin session that acts as the user
      const response = NextResponse.json({
        success: true,
        message: 'Temporary admin session created',
        userProfile: userProfile,
        method: 'admin_impersonation'
      })

      // Set a special cookie to indicate admin impersonation
      console.log('🍪 Setting impersonation cookies for user without auth:', { userId, userName })
      
      response.cookies.set('admin_impersonating', userId, {
        httpOnly: false, // Change to false so we can read it client-side
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2 // 2 hours
      })

      response.cookies.set('impersonated_user_name', encodeURIComponent(userName), {
        httpOnly: false, // Allow client-side access for UI
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 2 // 2 hours
      })

      return response
    }

    // For users with auth records, use impersonation approach instead of magic links
    console.log('✅ Setting up impersonation for authenticated user')

    const response = NextResponse.json({
      success: true,
      message: 'User impersonation session created',
      userProfile: userProfile,
      method: 'admin_impersonation'
    })

    // Set impersonation cookies for authenticated users too
    console.log('🍪 Setting impersonation cookies:', { userId, userName })
    
    response.cookies.set('admin_impersonating', userId, {
      httpOnly: false, // Change to false so we can read it client-side
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2 // 2 hours
    })

    response.cookies.set('impersonated_user_name', encodeURIComponent(userName), {
      httpOnly: false, // Allow client-side access for UI
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