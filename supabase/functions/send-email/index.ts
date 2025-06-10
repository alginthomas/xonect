
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ProfessionalEmail } from './_templates/professional-email.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client for rate limiting and authentication
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  leadName: string;
  senderName: string;
  senderEmail: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyAddress?: string;
}

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting check (100 emails per hour per user)
const checkRateLimit = async (userId: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Get current rate limit record
  const { data: rateLimitData, error: rateLimitError } = await supabase
    .from('email_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .gte('window_start', oneHourAgo)
    .single();

  if (rateLimitError && rateLimitError.code !== 'PGRST116') {
    console.error('Rate limit check error:', rateLimitError);
    return false;
  }

  if (!rateLimitData) {
    // Create new rate limit record
    await supabase
      .from('email_rate_limits')
      .insert({
        user_id: userId,
        email_count: 1,
        window_start: new Date().toISOString(),
      });
    return true;
  }

  if (rateLimitData.email_count >= 100) {
    return false; // Rate limit exceeded
  }

  // Update count
  await supabase
    .from('email_rate_limits')
    .update({ email_count: rateLimitData.email_count + 1 })
    .eq('id', rateLimitData.id);

  return true;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(user.id);
    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 100 emails per hour.' }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const {
      to,
      subject,
      content,
      leadName,
      senderName,
      senderEmail,
      companyName,
      companyLogo,
      companyWebsite,
      companyAddress
    }: EmailRequest = await req.json();

    // Input validation
    if (!to || !subject || !content || !leadName || !senderName || !senderEmail || !companyName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email validation
    if (!isValidEmail(to) || !isValidEmail(senderEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Content length validation
    if (content.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Email content too long (max 10,000 characters)' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Sending authenticated email to:', to, 'from user:', user.id);

    // Sanitize content to prevent XSS
    const sanitizedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');

    const html = await renderAsync(
      React.createElement(ProfessionalEmail, {
        content: sanitizedContent,
        leadName,
        senderName,
        senderEmail,
        companyName,
        companyLogo,
        companyWebsite,
        companyAddress,
      })
    );

    const emailResponse = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
