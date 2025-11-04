-- Fix marketing campaigns table to support media storage
-- Run this in your Supabase SQL editor

-- Add platform_settings column to store campaign media and settings
ALTER TABLE public.marketing_campaigns 
ADD COLUMN IF NOT EXISTS platform_settings JSONB DEFAULT '{}';

-- Create campaign_media table for better media management
CREATE TABLE IF NOT EXISTS public.campaign_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on campaign_media
ALTER TABLE public.campaign_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_media
CREATE POLICY "Users can view their own campaign media" ON public.campaign_media
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own campaign media" ON public.campaign_media
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own campaign media" ON public.campaign_media
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own campaign media" ON public.campaign_media
    FOR DELETE USING (auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_media_campaign_id ON public.campaign_media(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_media_profile_id ON public.campaign_media(profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_media_created_at ON public.campaign_media(created_at DESC);

-- Create updated_at trigger for campaign_media
CREATE TRIGGER update_campaign_media_updated_at 
    BEFORE UPDATE ON public.campaign_media 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing campaigns to have empty platform_settings if null
UPDATE public.marketing_campaigns 
SET platform_settings = '{}' 
WHERE platform_settings IS NULL;
