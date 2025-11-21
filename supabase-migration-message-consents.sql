-- Create message_consents table to track user consent for viewing business listings
CREATE TABLE IF NOT EXISTS message_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  consented BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_message_consents_business_name ON message_consents(business_name);
CREATE INDEX IF NOT EXISTS idx_message_consents_listing_id ON message_consents(listing_id);
CREATE INDEX IF NOT EXISTS idx_message_consents_consented ON message_consents(consented);
CREATE INDEX IF NOT EXISTS idx_message_consents_created_at ON message_consents(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE message_consents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for tracking consent)
CREATE POLICY "Allow consent tracking" ON message_consents
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reading consent data (for analytics)
CREATE POLICY "Allow reading consent data" ON message_consents
  FOR SELECT USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_consents_updated_at 
  BEFORE UPDATE ON message_consents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();