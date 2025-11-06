-- Week 12: WhatsApp & Facebook Campaign Management System
-- Database schema for n8n automation-based campaign management

-- Create social media groups table
CREATE TABLE IF NOT EXISTS social_media_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'facebook')),
    group_name TEXT NOT NULL,
    group_id TEXT, -- Platform-specific group ID
    group_url TEXT, -- Group URL or invite link
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT, -- Admin notes about the group
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'social_media' CHECK (campaign_type IN ('social_media', 'whatsapp', 'facebook')),
    message_content TEXT NOT NULL,
    image_urls TEXT[], -- Array of image URLs
    target_platforms TEXT[] DEFAULT ARRAY['whatsapp', 'facebook'], -- Which platforms to post to
    
    -- Scheduling
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_type TEXT DEFAULT 'weekly' CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly')),
    start_date DATE,
    start_time TIME,
    repeat_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- Days of week (1=Monday, 7=Sunday)
    
    -- Limits and tracking
    max_groups_per_day INTEGER DEFAULT 50,
    max_members_per_group_per_day INTEGER DEFAULT 10,
    total_groups_targeted INTEGER DEFAULT 0,
    total_posts_sent INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    
    -- n8n integration
    n8n_webhook_url TEXT, -- n8n webhook URL for this campaign
    n8n_workflow_id TEXT, -- n8n workflow ID
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign groups junction table (many-to-many)
CREATE TABLE IF NOT EXISTS campaign_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES social_media_groups(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1, -- Posting priority (1=highest)
    last_posted_at TIMESTAMP WITH TIME ZONE,
    posts_sent_today INTEGER DEFAULT 0,
    total_posts_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, group_id)
);

-- Create campaign execution log
CREATE TABLE IF NOT EXISTS campaign_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    group_id UUID REFERENCES social_media_groups(id) ON DELETE SET NULL,
    execution_date DATE DEFAULT CURRENT_DATE,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Execution details
    platform TEXT NOT NULL,
    group_name TEXT,
    message_sent TEXT,
    images_sent TEXT[],
    
    -- Status and results
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    n8n_execution_id TEXT,
    
    -- Metrics
    members_reached INTEGER DEFAULT 0,
    estimated_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_media_groups_profile_platform ON social_media_groups(profile_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_media_groups_active ON social_media_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_profile_status ON marketing_campaigns(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_scheduled ON marketing_campaigns(is_scheduled, status);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_campaign ON campaign_groups(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_campaign_date ON campaign_executions(campaign_id, execution_date);
CREATE INDEX IF NOT EXISTS idx_campaign_executions_status ON campaign_executions(status);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_social_media_groups_updated_at 
    BEFORE UPDATE ON social_media_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at 
    BEFORE UPDATE ON marketing_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for campaign analytics
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
    c.id as campaign_id,
    c.campaign_name,
    c.profile_id,
    c.status,
    c.created_at,
    
    -- Group counts
    COUNT(DISTINCT cg.group_id) as total_groups,
    COUNT(DISTINCT CASE WHEN cg.is_active THEN cg.group_id END) as active_groups,
    
    -- Execution stats
    COUNT(DISTINCT ce.id) as total_executions,
    COUNT(DISTINCT CASE WHEN ce.status = 'sent' THEN ce.id END) as successful_posts,
    COUNT(DISTINCT CASE WHEN ce.status = 'failed' THEN ce.id END) as failed_posts,
    
    -- Reach metrics
    SUM(CASE WHEN ce.status = 'sent' THEN ce.members_reached ELSE 0 END) as total_members_reached,
    SUM(CASE WHEN ce.status = 'sent' THEN ce.estimated_views ELSE 0 END) as total_estimated_views,
    
    -- Platform breakdown
    COUNT(DISTINCT CASE WHEN smg.platform = 'whatsapp' AND ce.status = 'sent' THEN ce.id END) as whatsapp_posts,
    COUNT(DISTINCT CASE WHEN smg.platform = 'facebook' AND ce.status = 'sent' THEN ce.id END) as facebook_posts,
    
    -- Recent activity
    MAX(ce.execution_time) as last_execution,
    COUNT(DISTINCT CASE WHEN ce.execution_date = CURRENT_DATE THEN ce.id END) as posts_today
    
FROM marketing_campaigns c
LEFT JOIN campaign_groups cg ON c.id = cg.campaign_id
LEFT JOIN social_media_groups smg ON cg.group_id = smg.id
LEFT JOIN campaign_executions ce ON c.id = ce.campaign_id
GROUP BY c.id, c.campaign_name, c.profile_id, c.status, c.created_at;

-- Create function to get daily posting limits
CREATE OR REPLACE FUNCTION check_daily_posting_limits(
    p_campaign_id UUID,
    p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    can_post BOOLEAN,
    groups_posted_today INTEGER,
    max_groups_per_day INTEGER,
    remaining_groups INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (COUNT(DISTINCT ce.group_id) < c.max_groups_per_day) as can_post,
        COUNT(DISTINCT ce.group_id)::INTEGER as groups_posted_today,
        c.max_groups_per_day,
        GREATEST(0, c.max_groups_per_day - COUNT(DISTINCT ce.group_id))::INTEGER as remaining_groups
    FROM marketing_campaigns c
    LEFT JOIN campaign_executions ce ON c.id = ce.campaign_id 
        AND ce.execution_date = p_target_date 
        AND ce.status = 'sent'
    WHERE c.id = p_campaign_id
    GROUP BY c.id, c.max_groups_per_day;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate n8n webhook payload
CREATE OR REPLACE FUNCTION generate_n8n_payload(
    p_campaign_id UUID,
    p_group_id UUID
)
RETURNS JSONB AS $$
DECLARE
    campaign_data RECORD;
    group_data RECORD;
    payload JSONB;
BEGIN
    -- Get campaign data
    SELECT * INTO campaign_data 
    FROM marketing_campaigns 
    WHERE id = p_campaign_id;
    
    -- Get group data
    SELECT * INTO group_data 
    FROM social_media_groups 
    WHERE id = p_group_id;
    
    -- Build payload
    payload := jsonb_build_object(
        'campaign_id', p_campaign_id,
        'group_id', p_group_id,
        'platform', group_data.platform,
        'group_name', group_data.group_name,
        'group_url', group_data.group_url,
        'message', campaign_data.message_content,
        'images', campaign_data.image_urls,
        'max_members', campaign_data.max_members_per_group_per_day,
        'execution_time', NOW()
    );
    
    RETURN payload;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE social_media_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_executions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own groups and campaigns
CREATE POLICY "Users can manage own groups" ON social_media_groups
    FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own campaigns" ON marketing_campaigns
    FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own campaign groups" ON campaign_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM marketing_campaigns 
            WHERE id = campaign_id AND profile_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own campaign executions" ON campaign_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM marketing_campaigns 
            WHERE id = campaign_id AND profile_id = auth.uid()
        )
    );

-- Admins can view all data
CREATE POLICY "Admins can view all groups" ON social_media_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all campaigns" ON marketing_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Insert some default WhatsApp and Facebook groups for testing
INSERT INTO social_media_groups (profile_id, platform, group_name, group_url, member_count, notes) 
SELECT 
    (SELECT id FROM profiles WHERE email = 'admin@out.com' LIMIT 1),
    'whatsapp',
    'Business Network SA',
    'https://chat.whatsapp.com/example1',
    150,
    'Active business networking group'
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@out.com');

INSERT INTO social_media_groups (profile_id, platform, group_name, group_url, member_count, notes) 
SELECT 
    (SELECT id FROM profiles WHERE email = 'admin@out.com' LIMIT 1),
    'facebook',
    'Cape Town Entrepreneurs',
    'https://facebook.com/groups/example1',
    300,
    'Local entrepreneur community'
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@out.com');

-- Summary
SELECT 'Campaign management system setup complete!' as status;
SELECT 'Tables: social_media_groups, marketing_campaigns, campaign_groups, campaign_executions' as tables_created;
SELECT 'Functions: check_daily_posting_limits, generate_n8n_payload' as functions_created;
SELECT 'View: campaign_analytics' as views_created;
