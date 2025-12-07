-- WhatsApp Groups & Members Schema
-- This schema stores WhatsApp group information and their members for easy access later

-- Table 1: WhatsApp Groups
-- Stores information about each WhatsApp group the user has
CREATE TABLE IF NOT EXISTS whatsapp_groups (
  id TEXT PRIMARY KEY,                    -- WhatsApp group ID (e.g., "120363123456789@g.us")
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- Group name (e.g., "Marketing Team", "Customers")
  member_count INTEGER DEFAULT 0,         -- Total members in the group
  last_synced TIMESTAMP WITH TIME ZONE,   -- When we last updated the member list
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, id)                     -- One user can't have duplicate groups
);

-- Table 2: WhatsApp Group Members
-- Stores all members of each group
CREATE TABLE IF NOT EXISTS whatsapp_group_members (
  id TEXT PRIMARY KEY,                    -- Unique ID (group_id + member_id)
  group_id TEXT NOT NULL REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,                -- WhatsApp member ID
  name TEXT NOT NULL,                     -- Member's display name
  phone TEXT,                             -- Member's phone number (if available)
  is_admin BOOLEAN DEFAULT FALSE,         -- Is this member a group admin?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, member_id)             -- Can't have duplicate members in a group
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_user_id ON whatsapp_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_group_id ON whatsapp_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_user_id ON whatsapp_group_members(user_id);

-- Example queries to understand the data:

-- 1. Get all groups for a user
-- SELECT * FROM whatsapp_groups WHERE user_id = 'user-uuid-here';

-- 2. Get all members of a specific group
-- SELECT * FROM whatsapp_group_members WHERE group_id = 'group-id-here' ORDER BY name;

-- 3. Get all members across all groups for a user
-- SELECT g.name as group_name, m.name as member_name, m.phone, m.is_admin
-- FROM whatsapp_group_members m
-- JOIN whatsapp_groups g ON m.group_id = g.id
-- WHERE m.user_id = 'user-uuid-here'
-- ORDER BY g.name, m.name;

-- 4. Find a specific member across all groups
-- SELECT g.name as group_name, m.name as member_name, m.phone
-- FROM whatsapp_group_members m
-- JOIN whatsapp_groups g ON m.group_id = g.id
-- WHERE m.user_id = 'user-uuid-here' AND m.name ILIKE '%search-term%';

-- 5. Get group admins
-- SELECT g.name as group_name, m.name as admin_name, m.phone
-- FROM whatsapp_group_members m
-- JOIN whatsapp_groups g ON m.group_id = g.id
-- WHERE m.user_id = 'user-uuid-here' AND m.is_admin = TRUE;
