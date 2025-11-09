import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// n8n Webhook Handler for Campaign Automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract campaign execution data from n8n
    const {
      campaign_id,
      group_id,
      execution_id,
      status,
      error_message,
      members_reached,
      platform,
      group_name
    } = body

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Log the campaign execution
    const { error: logError } = await supabase
      .from('campaign_executions')
      .insert({
        campaign_id,
        group_id: group_id || null,
        platform: platform || 'unknown',
        group_name: group_name || null,
        status: status || 'pending',
        error_message: error_message || null,
        members_reached: members_reached || 0,
        n8n_execution_id: execution_id || null,
        estimated_views: members_reached ? Math.floor(members_reached * 0.3) : 0 // Estimate 30% view rate
      })

    if (logError) {
      console.error('Error logging campaign execution:', logError)
      return NextResponse.json(
        { error: 'Failed to log execution' },
        { status: 500 }
      )
    }

    // Update campaign statistics if successful
    if (status === 'sent' && group_id) {
      // Get current counts first
      const { data: currentGroup } = await supabase
        .from('campaign_groups')
        .select('messages_sent_today, total_messages_sent')
        .eq('campaign_id', campaign_id)
        .eq('group_id', group_id)
        .single()

      const { data: currentCampaign } = await supabase
        .from('marketing_campaigns')
        .select('total_messages_sent')
        .eq('id', campaign_id)
        .single()

      // Update campaign groups table
      if (currentGroup) {
        await supabase
          .from('campaign_groups')
          .update({
            last_message_sent_at: new Date().toISOString(),
            messages_sent_today: (currentGroup.messages_sent_today || 0) + 1,
            total_messages_sent: (currentGroup.total_messages_sent || 0) + 1
          })
          .eq('campaign_id', campaign_id)
          .eq('group_id', group_id)
      }

      // Update main campaign stats
      if (currentCampaign) {
        await supabase
          .from('marketing_campaigns')
          .update({
            total_messages_sent: (currentCampaign.total_messages_sent || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign_id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      execution_logged: true
    })

  } catch (error) {
    console.error('n8n webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve campaign data for n8n workflows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    const action = searchParams.get('action')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'get_campaign_data':
        return await getCampaignData(campaignId)
      
      case 'get_next_groups':
        return await getNextGroupsToPost(campaignId)
      
      case 'check_limits':
        return await checkDailyLimits(campaignId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('n8n GET webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get campaign data
async function getCampaignData(campaignId: string) {
  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .select(`
      *,
      campaign_groups (
        *,
        social_media_groups (*)
      )
    `)
    .eq('id', campaignId)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Campaign not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    campaign,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/webhook`,
    total_groups: campaign.campaign_groups?.length || 0
  })
}

// Helper function to get next groups to send messages to
async function getNextGroupsToPost(campaignId: string) {
  try {
    // Get campaign limits
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('max_groups_per_day, max_members_per_group_per_day')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check how many groups we've sent messages to today
    const { data: todayExecutions } = await supabase
      .from('campaign_executions')
      .select('group_id')
      .eq('campaign_id', campaignId)
      .eq('execution_date', new Date().toISOString().split('T')[0])
      .eq('status', 'sent')

    const messagesSentToGroupsToday = new Set(todayExecutions?.map(e => e.group_id) || [])
    const remainingGroupsToday = campaign.max_groups_per_day - messagesSentToGroupsToday.size

    if (remainingGroupsToday <= 0) {
      return NextResponse.json({
        groups: [],
        message: 'Daily group limit reached',
        remaining_groups: 0
      })
    }

    // Get available groups that haven't received messages today
    const { data: availableGroups } = await supabase
      .from('campaign_groups')
      .select(`
        *,
        social_media_groups (*)
      `)
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .not('group_id', 'in', `(${Array.from(messagesSentToGroupsToday).join(',')})`)
      .order('priority')
      .limit(remainingGroupsToday)

    const groupsToPost = availableGroups?.map(cg => ({
      campaign_group_id: cg.id,
      group_id: cg.group_id,
      group_name: cg.social_media_groups.group_name,
      platform: cg.social_media_groups.platform,
      group_url: cg.social_media_groups.group_url,
      member_count: cg.social_media_groups.member_count,
      max_members_to_reach: campaign.max_members_per_group_per_day,
      priority: cg.priority
    })) || []

    return NextResponse.json({
      groups: groupsToPost,
      remaining_groups: remainingGroupsToday,
      total_available: groupsToPost.length
    })

  } catch (error) {
    console.error('Error getting next groups:', error)
    return NextResponse.json(
      { error: 'Failed to get next groups' },
      { status: 500 }
    )
  }
}

// Helper function to check daily limits
async function checkDailyLimits(campaignId: string) {
  try {
    const { data: limits } = await supabase
      .rpc('check_daily_messaging_limits', {
        p_campaign_id: campaignId,
        p_target_date: new Date().toISOString().split('T')[0]
      })

    if (!limits || limits.length === 0) {
      return NextResponse.json({
        can_send: false,
        groups_messaged_today: 0,
        max_groups_per_day: 0,
        remaining_groups: 0
      })
    }

    return NextResponse.json(limits[0])

  } catch (error) {
    console.error('Error checking limits:', error)
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update campaign status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, status, n8n_workflow_id } = body

    if (!campaign_id || !status) {
      return NextResponse.json(
        { error: 'Campaign ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (n8n_workflow_id) {
      updateData.n8n_workflow_id = n8n_workflow_id
    }

    const { error } = await supabase
      .from('marketing_campaigns')
      .update(updateData)
      .eq('id', campaign_id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign status updated'
    })

  } catch (error) {
    console.error('n8n PUT webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
