/**
 * WhatsApp Group Manager
 * 
 * This utility helps manage WhatsApp groups and their members.
 * Think of it like organizing your contacts into folders:
 * - Each folder = a WhatsApp group
 * - Each contact in the folder = a group member
 */

interface GroupMember {
  id: string
  name: string
  phone?: string
  isAdmin?: boolean
}

interface WhatsAppGroup {
  id: string
  name: string
  members: GroupMember[]
}

/**
 * Save group members to Supabase
 * 
 * @param userId - The user's ID
 * @param group - The group object with id, name, and members
 * @returns Success/error response
 */
export async function saveGroupMembers(userId: string, group: WhatsAppGroup) {
  try {
    console.log(`💾 Saving group: "${group.name}" with ${group.members.length} members`)

    const response = await fetch('/api/whatsapp/save-group-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        groupId: group.id,
        groupName: group.name,
        members: group.members,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save group members')
    }

    const result = await response.json()
    console.log(`✅ ${result.message}`)
    return result
  } catch (error) {
    console.error('❌ Error saving group members:', error)
    throw error
  }
}

/**
 * Save all groups and their members
 * 
 * @param userId - The user's ID
 * @param groups - Array of groups with members
 */
export async function saveAllGroupMembers(userId: string, groups: WhatsAppGroup[]) {
  console.log(`💾 Saving ${groups.length} groups...`)

  const results = []
  for (const group of groups) {
    try {
      const result = await saveGroupMembers(userId, group)
      results.push({ group: group.name, success: true, ...result })
    } catch (error) {
      results.push({
        group: group.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Format group data for display
 * Shows: Group Name (X members)
 */
export function formatGroupDisplay(group: WhatsAppGroup): string {
  return `${group.name} (${group.members.length} members)`
}

/**
 * Format member data for display
 * Shows: Member Name (Admin) or just Member Name
 */
export function formatMemberDisplay(member: GroupMember): string {
  const adminBadge = member.isAdmin ? ' 👑' : ''
  return `${member.name}${adminBadge}`
}
