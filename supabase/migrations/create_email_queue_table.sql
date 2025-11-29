-- Create email queue table for storing emails when immediate sending fails
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    email_type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_type ON email_queue(email_type);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own queued emails
CREATE POLICY "Users can view their own queued emails" ON email_queue
    FOR SELECT USING (auth.uid()::text = metadata->>'user_id');

-- Create policy for service role to manage all emails
CREATE POLICY "Service role can manage all emails" ON email_queue
    FOR ALL USING (auth.role() = 'service_role');
