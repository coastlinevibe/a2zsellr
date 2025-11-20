import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// API endpoint to delete user authentication
export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    console.log(`🗑️ Deleting authentication for user: ${userId} (${userEmail})`)
    
    // Create Supabase admin client (requires service role key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // This is the service role key, not anon key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Delete user from Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authDeleteError) {
      console.error('❌ Error deleting user authentication:', authDeleteError)
      return NextResponse.json({ 
        error: 'Failed to delete user authentication',
        details: authDeleteError.message 
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully deleted authentication for user: ${userId}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `User authentication deleted for ${userEmail}`,
      userId 
    })
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check if user exists in auth
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Check if user exists in auth
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error) {
      return NextResponse.json({ exists: false, error: error.message })
    }
    
    return NextResponse.json({ 
      exists: !!data?.user,
      user: data?.user ? { 
        id: data.user.id, 
        email: data.user.email, 
        created_at: data.user.created_at 
      } : null
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'API error' }, { status: 500 })
  }
}