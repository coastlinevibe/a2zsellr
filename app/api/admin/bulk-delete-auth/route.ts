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
    const { userIds, userEmails } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs array is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Bulk deleting authentication for ${userIds.length} users`)

    const results = {
      deleted: 0,
      errors: [] as string[]
    }

    // Delete users in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize)
      
      for (const userId of batch) {
        try {
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
          
          if (error) {
            console.error(`❌ Failed to delete auth for user ${userId}:`, error)
            results.errors.push(`User ${userId}: ${error.message}`)
          } else {
            console.log(`✅ Deleted auth for user ${userId}`)
            results.deleted++
          }
        } catch (error) {
          console.error(`❌ Exception deleting auth for user ${userId}:`, error)
          results.errors.push(`User ${userId}: ${error}`)
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`✅ Bulk auth deletion complete: ${results.deleted} deleted, ${results.errors.length} errors`)

    return NextResponse.json({
      success: true,
      message: `Bulk authentication deletion completed`,
      results: {
        totalUsers: userIds.length,
        deleted: results.deleted,
        errors: results.errors.length,
        errorDetails: results.errors.length > 0 ? results.errors : null
      }
    })

  } catch (error) {
    console.error('❌ Bulk auth deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}