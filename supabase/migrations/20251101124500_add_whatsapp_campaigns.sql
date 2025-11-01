-- WhatsApp Campaign infrastructure for A2Z Sellr

-- Campaigns table stores core metadata about each WhatsApp campaign
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  layout_type TEXT NOT NULL CHECK (layout_type IN (
    'gallery_mosaic',
    'hover_cards',
    'slider_vertical',
    'slider_horizontal',
    'before_after',
    'video_spotlight'
  )),
  listing_id UUID,
  message_template TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'sent', 'failed'
  )),
  early_adopter BOOLEAN DEFAULT false,
  metrics JSONB DEFAULT jsonb_build_object(
    'delivered', 0,
    'read', 0,
    'clicked', 0
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores layout configuration and assets (images, videos, colors)
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  media JSONB DEFAULT '[]'::jsonb,
  theme JSONB DEFAULT jsonb_build_object(
    'primary', '#10b981',
    'secondary', '#0f172a',
    'background', '#f8fafc'
  ),
  advanced_options JSONB DEFAULT jsonb_build_object(
    'hover_effect', true,
    'auto_play', true,
    'loop_video', false,
    'show_social_proof', true
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audience contacts imported for each campaign
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for compliance and troubleshooting
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_audit (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS policies
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_audit ENABLE ROW LEVEL SECURITY;

-- Policies: profile owners can manage their campaigns
CREATE POLICY "campaigns_select_own" ON public.whatsapp_campaigns
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "campaigns_modify_own" ON public.whatsapp_campaigns
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "campaign_layout_select" ON public.whatsapp_campaign_layouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "campaign_layout_modify" ON public.whatsapp_campaign_layouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "campaign_contacts_select" ON public.whatsapp_campaign_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "campaign_contacts_modify" ON public.whatsapp_campaign_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "campaign_audit_select" ON public.whatsapp_campaign_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_campaigns c
      WHERE c.id = campaign_id AND c.profile_id = auth.uid()
    )
  );

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS whatsapp_campaigns_set_updated_at ON public.whatsapp_campaigns;
CREATE TRIGGER whatsapp_campaigns_set_updated_at
  BEFORE UPDATE ON public.whatsapp_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
