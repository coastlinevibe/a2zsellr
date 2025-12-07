'use client'

import { useState, useEffect } from 'react'
import { Users, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface GroupMember {
  id: string
  name: string
  phone?: string
  is_admin: boolean
}

interface SavedGroup {
  id: string
  name: string
  member_count: number
  last_synced: string
  members?: GroupMember[]
}

export function SavedGroupsView() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<SavedGroup[]>([])
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState<string | null>(null)

  // Load groups on mount
  useEffect(() => {
    if (user?.id) {
      loadGroups()
    }
  }, [user?.id])

  const loadGroups = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('whatsapp_groups')
        .select('id, name, member_count, last_synced')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error

      setGroups(data || [])
      console.log(`✅ Loaded ${data?.length || 0} groups`)
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGroupMembers = async (groupId: string) => {
    setLoadingMembers(groupId)
    try {
      const { data, error } = await supabase
        .from('whatsapp_group_members')
        .select('id, name, phone, is_admin')
        .eq('group_id', groupId)
        .order('is_admin', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error

      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, members: data || [] } : g
        )
      )
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setLoadingMembers(null)
    }
  }

  const toggleGroup = async (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null)
    } else {
      setExpandedGroup(groupId)
      // Load members if not already loaded
      const group = groups.find(g => g.id === groupId)
      if (!group?.members) {
        await loadGroupMembers(groupId)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading groups...</span>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No groups saved yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Connect WhatsApp and sync groups to see them here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black">📁 Your WhatsApp Groups</h3>
        <button
          onClick={loadGroups}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh groups"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {groups.map(group => (
        <div
          key={group.id}
          className="border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Group Header */}
          <button
            onClick={() => toggleGroup(group.id)}
            className="w-full p-4 bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1 text-left">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-black">{group.name}</div>
                <div className="text-sm text-gray-600">
                  {group.member_count} members
                </div>
              </div>
            </div>
            {expandedGroup === group.id ? (
              <ChevronUp className="w-5 h-5 text-black" />
            ) : (
              <ChevronDown className="w-5 h-5 text-black" />
            )}
          </button>

          {/* Group Members List */}
          {expandedGroup === group.id && (
            <div className="bg-white p-4 border-t-2 border-black">
              {loadingMembers === group.id ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading members...</span>
                </div>
              ) : group.members && group.members.length > 0 ? (
                <div className="space-y-2">
                  {group.members.map(member => (
                    <div
                      key={member.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-black flex items-center gap-2">
                          {member.name}
                          {member.is_admin && (
                            <span className="text-xs bg-yellow-300 text-black px-2 py-1 rounded font-bold">
                              👑 ADMIN
                            </span>
                          )}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-600">{member.phone}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No members found</p>
              )}
              <div className="text-xs text-gray-500 mt-3">
                Last synced: {new Date(group.last_synced).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
