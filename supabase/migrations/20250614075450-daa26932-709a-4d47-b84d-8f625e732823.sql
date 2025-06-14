
-- Create table to store Mailchimp OAuth tokens and integration settings per user
CREATE TABLE public.mailchimp_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  server_prefix TEXT NOT NULL, -- e.g., 'us1', 'us2', etc.
  account_id TEXT,
  account_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One integration per user
);

-- Create table to track Mailchimp campaigns created through the app
CREATE TABLE public.mailchimp_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mailchimp_campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  audience_id TEXT NOT NULL,
  audience_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  leads_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track which leads were added to which Mailchimp audiences
CREATE TABLE public.mailchimp_lead_syncs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  audience_id TEXT NOT NULL,
  mailchimp_member_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending', -- pending, synced, failed
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, audience_id) -- Prevent duplicate syncs
);

-- Enable Row Level Security
ALTER TABLE public.mailchimp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailchimp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailchimp_lead_syncs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mailchimp_integrations
CREATE POLICY "Users can view their own Mailchimp integration" 
  ON public.mailchimp_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Mailchimp integration" 
  ON public.mailchimp_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mailchimp integration" 
  ON public.mailchimp_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Mailchimp integration" 
  ON public.mailchimp_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for mailchimp_campaigns
CREATE POLICY "Users can view their own Mailchimp campaigns" 
  ON public.mailchimp_campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Mailchimp campaigns" 
  ON public.mailchimp_campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mailchimp campaigns" 
  ON public.mailchimp_campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Mailchimp campaigns" 
  ON public.mailchimp_campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for mailchimp_lead_syncs
CREATE POLICY "Users can view their own Mailchimp lead syncs" 
  ON public.mailchimp_lead_syncs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Mailchimp lead syncs" 
  ON public.mailchimp_lead_syncs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mailchimp lead syncs" 
  ON public.mailchimp_lead_syncs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Mailchimp lead syncs" 
  ON public.mailchimp_lead_syncs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_mailchimp_integrations_updated_at
  BEFORE UPDATE ON public.mailchimp_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mailchimp_campaigns_updated_at
  BEFORE UPDATE ON public.mailchimp_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
