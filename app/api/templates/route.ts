import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tier = searchParams.get('tier') || 'free'

    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Filter by tier access
    const tierHierarchy = {
      'free': ['free'],
      'premium': ['free', 'premium'],
      'business': ['free', 'premium', 'business']
    }

    const allowedTiers = tierHierarchy[tier as keyof typeof tierHierarchy] || ['free']
    query = query.in('tier_required', allowedTiers)

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, profile_id, customizations } = body

    // Create a user template instance
    const { data: userTemplate, error } = await supabase
      .from('user_templates')
      .insert({
        profile_id,
        template_id,
        name: customizations.name || 'My Template',
        customized_data: customizations
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user template:', error)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ userTemplate })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
