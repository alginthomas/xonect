
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthCallbackRequest {
  code: string;
  state?: string;
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

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'GET') {
      // Generate OAuth URL
      const clientId = Deno.env.get('MAILCHIMP_CLIENT_ID');
      const redirectUri = `${req.url.split('/functions/')[0]}/functions/v1/mailchimp-oauth`;
      
      const oauthUrl = `https://login.mailchimp.com/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${user.id}`;

      return new Response(JSON.stringify({ oauthUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const { code }: OAuthCallbackRequest = await req.json();
      
      if (!code) {
        throw new Error('Authorization code is required');
      }

      // Exchange code for access token
      const clientId = Deno.env.get('MAILCHIMP_CLIENT_ID');
      const clientSecret = Deno.env.get('MAILCHIMP_CLIENT_SECRET');
      const redirectUri = `${req.url.split('/functions/')[0]}/functions/v1/mailchimp-oauth`;

      const tokenResponse = await fetch('https://login.mailchimp.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        throw new Error('Failed to exchange authorization code');
      }

      const tokenData = await tokenResponse.json();
      const { access_token } = tokenData;

      // Get account information
      const accountResponse = await fetch('https://login.mailchimp.com/oauth2/metadata', {
        headers: {
          'Authorization': `OAuth ${access_token}`,
        },
      });

      if (!accountResponse.ok) {
        throw new Error('Failed to get account information');
      }

      const accountData = await accountResponse.json();
      const { dc } = accountData;

      // Store integration in database
      const { error: insertError } = await supabase
        .from('mailchimp_integrations')
        .upsert({
          user_id: user.id,
          access_token,
          server_prefix: dc,
          account_id: accountData.accountname || '',
          account_name: accountData.accountname || '',
          is_active: true,
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to store integration');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        accountName: accountData.accountname,
        serverPrefix: dc 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
