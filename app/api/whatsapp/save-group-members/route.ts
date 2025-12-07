'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface GroupMember {
  id: string
  name: string
  phone?: string
  isAdmin?: boolean
}

interface SaveGroupMembersRequest {
  userId: string
  groupId: string
  groupName: string
  members: GroupMember[]
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveGroupMembersRequest = await request.json()
    const { userId, groupId, groupName, members } = body

    if (!userId || !groupId || !groupName || !members) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, groupId, groupName, members' },
        { status: 400 }
      )
    }

    console.log(`💾 [SAVE-GROUP-MEMBERS] Saving ${members.length} members for group "${groupName}" (${groupId})`)

    // 1. Create or update the group record
    const { data: groupData, error: groupError } = await supabase
      .from('whatsapp_groups')
      .upsert(
        {
          id: groupId,
          user_id: userId,
          name: groupName,
          member_count: members.length,
          last_synced: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()

    if (groupError) {
      console.error('❌ Error saving group:', groupError)
      return NextResponse.json(
        { error: `Failed to save group: ${groupError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Group saved/updated: ${groupId}`)

    // 2. Delete old members for this group (to avoid duplicates)
    const { error: deleteError } = await supabase
      .from('whatsapp_group_members')
      .delete()
      .eq('group_id', groupId)

    if (deleteError) {
      console.error('⚠️ Warning: Could not delete old members:', deleteError)
      // Don't fail, just warn
    }

    // 3. Insert new members
    const membersToInsert = members.map((member) => ({
      id: `${groupId}_${member.id}`,
      group_id: groupId,
      user_id: userId,
      member_id: member.id,
      name: member.name,
      phone: member.phone || null,
      is_admin: member.isAdmin || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: membersData, error: membersError } = await supabase
      .from('whatsapp_group_members')
      .insert(membersToInsert)
      .select()

    if (membersError) {
      console.error('❌ Error saving members:', membersError)
      return NextResponse.json(
        { error: `Failed to save members: ${membersError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Saved ${membersData?.length || 0} members for group "${groupName}"`)

    return NextResponse.json({
      success: true,
      message: `Saved ${members.length} members for group "${groupName}"`,
      groupId,
      memberCount: members.length,
    })
  } catch (error) {
    console.error('❌ [SAVE-GROUP-MEMBERS] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save group members' },
      { status: 500 }
    )
  }
}
