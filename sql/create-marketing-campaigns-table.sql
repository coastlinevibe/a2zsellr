-- Create marketing_campaigns table with proper structure
-- Run this in your Supabase SQL editor if the table doesn't work

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    layout_type TEXT NOT NULL CHECK (layout_type IN (
        'gallery-mosaic', 
        'hover-cards', 
        'before-after', 
        'video-spotlight', 
        'horizontal-slider', 
        'vertical-slider'
    )),
    message_template TEXT NOT NULL,
    target_platforms TEXT[] DEFAULT ARRAY['whatsapp'],
    cta_label TEXT DEFAULT 'Learn More',
    cta_url TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own campaigns" ON public.marketing_campaigns
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own campaigns" ON public.marketing_campaigns
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own campaigns" ON public.marketing_campaigns
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own campaigns" ON public.marketing_campaigns
    FOR DELETE USING (auth.uid() = profile_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketing_campaigns_updated_at 
    BEFORE UPDATE ON public.marketing_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_profile_id ON public.marketing_campaigns(profile_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON public.marketing_campaigns(created_at DESC);
