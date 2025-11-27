-- Create table to track WhatsApp sends for rate limiting
CREATE TABLE IF NOT EXISTS whatsapp_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('contact', 'group', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for efficient querying by user and time
  CONSTRAINT whatsapp_sends_user_time_idx UNIQUE (user_id, created_at)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_sends_user_created 
ON whatsapp_sends(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE whatsapp_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own sends
CREATE POLICY "Users can view their own sends"
  ON whatsapp_sends
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own sends
CREATE POLICY "Users can insert their own sends"
  ON whatsapp_sends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
