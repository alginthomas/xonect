
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddLeadsRequest {
  audienceId: string;
  leads: Array<{
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    title?: string;
  }>;
}

interface CreateCampaignRequest {
  name: string;
  subject: string;
  audienceId: string;
  content?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's Mailchimp integration
    const { data: integration, error: integrationError } = await supabase
      .from('mailchimp_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      throw new Error('Mailchimp integration not found');
    }

    const mailchimpBaseUrl = `https://${integration.server_prefix}.api.mailchimp.com/3.0`;
    const authHeaders = {
      'Authorization': `Bearer ${integration.access_token}`,
      'Content-Type': 'application/json',
    };

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'audiences': {
        // Get audiences/lists
        const response = await fetch(`${mailchimpBaseUrl}/lists`, {
          headers: authHeaders,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch audiences');
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add-leads': {
        const { audienceId, leads }: AddLeadsRequest = await req.json();

        const members = leads.map(lead => ({
          email_address: lead.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: lead.firstName,
            LNAME: lead.lastName,
            ...(lead.company && { COMPANY: lead.company }),
            ...(lead.title && { TITLE: lead.title }),
          },
        }));

        const response = await fetch(`${mailchimpBaseUrl}/lists/${audienceId}/members`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            members,
            update_existing: true,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Mailchimp API error:', error);
          throw new Error('Failed to add leads to audience');
        }

        const result = await response.json();

        // Track lead syncs in database
        for (const lead of leads) {
          await supabase.from('mailchimp_lead_syncs').insert({
            user_id: user.id,
            lead_id: lead.id || null,
            audience_id: audienceId,
            sync_status: 'synced',
            synced_at: new Date().toISOString(),
          });
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-campaign': {
        const { name, subject, audienceId, content }: CreateCampaignRequest = await req.json();

        const campaignData = {
          type: 'regular',
          recipients: {
            list_id: audienceId,
          },
          settings: {
            subject_line: subject,
            title: name,
            from_name: integration.account_name || 'Your Company',
            reply_to: user.email || 'noreply@example.com',
          },
        };

        const response = await fetch(`${mailchimpBaseUrl}/campaigns`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(campaignData),
        });

        if (!response.ok) {
          throw new Error('Failed to create campaign');
        }

        const campaign = await response.json();

        // Store campaign in database
        await supabase.from('mailchimp_campaigns').insert({
          user_id: user.id,
          mailchimp_campaign_id: campaign.id,
          campaign_name: name,
          subject_line: subject,
          audience_id: audienceId,
          status: campaign.status || 'draft',
        });

        return new Response(JSON.stringify(campaign), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response('Invalid action', { 
          status: 400, 
          headers: corsHeaders 
        });
    }

  } catch (error) {
    console.error('Mailchimp API error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
