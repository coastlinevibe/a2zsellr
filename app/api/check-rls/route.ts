import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const client = createClient(supabaseUrl, anonKey)

    // Try to fetch with different approaches
    const results: any = {}

    // Approach 1: Direct select
    console.log('1️⃣ Trying direct select...')
    const { data: direct, error: directError } = await client
      .from('profile_listings')
      .select('*')
      .limit(1)
    results.direct = { data: direct, error: directError?.message }

    // Approach 2: With count
    console.log('2️⃣ Trying with count...')
    const { data: withCount, error: countError, count } = await client
      .from('profile_listings')
      .select('*', { count: 'exact' })
      .limit(1)
    results.withCount = { data: withCount, error: countError?.message, count }

    // Approach 3: Check if table exists
    console.log('3️⃣ Checking table info...')
    const { data: tableInfo, error: tableError } = await client
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'profile_listings')
      .limit(1)
    results.tableInfo = { exists: !!tableInfo?.length, error: tableError?.message }

    // Approach 4: Try RPC call if available
    console.log('4️⃣ Trying RPC...')
    try {
      const { data: rpcData, error: rpcError } = await client
        .rpc('get_public_listings')
      results.rpc = { data: rpcData, error: rpcError?.message }
    } catch (e) {
      results.rpc = { error: 'RPC not available' }
    }

    return NextResponse.json({
      message: 'RLS Check Results',
      results,
      recommendation: 'If all approaches fail, RLS is blocking access. You need to either: 1) Disable RLS for profile_listings, 2) Create a public view, or 3) Use a service role key'
    })

  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
