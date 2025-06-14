
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Lead } from '@/types/lead';

interface MailchimpIntegration {
  id: string;
  isActive: boolean;
  accountName: string;
  serverPrefix: string;
}

interface MailchimpAudience {
  id: string;
  name: string;
  member_count?: number;
}

export const useMailchimpIntegration = () => {
  const [integration, setIntegration] = useState<MailchimpIntegration | null>(null);
  const [audiences, setAudiences] = useState<MailchimpAudience[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkIntegration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('mailchimp_integrations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking integration:', error);
        return;
      }

      if (data) {
        setIntegration({
          id: data.id,
          isActive: data.is_active,
          accountName: data.account_name || '',
          serverPrefix: data.server_prefix,
        });
        await fetchAudiences();
      }
    } catch (error) {
      console.error('Error checking integration:', error);
    }
  };

  const startOAuthFlow = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('mailchimp-oauth', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open OAuth URL in popup
      const popup = window.open(
        data.oauthUrl,
        'mailchimp-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for popup closure
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          checkIntegration(); // Refresh integration status
        }
      }, 1000);

    } catch (error) {
      console.error('OAuth flow error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Mailchimp. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAudiences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('mailchimp-api', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: { action: 'audiences' }
      });

      if (error) throw error;

      setAudiences(data.lists || []);
    } catch (error) {
      console.error('Error fetching audiences:', error);
    }
  };

  const addLeadsToAudience = async (audienceId: string, leads: Lead[]) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const leadsData = leads.map(lead => ({
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
        id: lead.id,
      }));

      const { data, error } = await supabase.functions.invoke('mailchimp-api?action=add-leads', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: {
          audienceId,
          leads: leadsData,
        }
      });

      if (error) throw error;

      toast({
        title: 'Leads Added',
        description: `Successfully added ${leads.length} leads to your Mailchimp audience`,
      });

      return data;
    } catch (error) {
      console.error('Error adding leads:', error);
      toast({
        title: 'Failed to Add Leads',
        description: 'There was an error adding leads to your Mailchimp audience',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (name: string, subject: string, audienceId: string, content?: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('mailchimp-api?action=create-campaign', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: {
          name,
          subject,
          audienceId,
          content,
        }
      });

      if (error) throw error;

      toast({
        title: 'Campaign Created',
        description: `Campaign "${name}" created successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Campaign Creation Failed',
        description: 'There was an error creating your campaign',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectIntegration = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !integration) return;

      const { error } = await supabase
        .from('mailchimp_integrations')
        .update({ is_active: false })
        .eq('id', integration.id);

      if (error) throw error;

      setIntegration(null);
      setAudiences([]);
      
      toast({
        title: 'Integration Disconnected',
        description: 'Mailchimp integration has been disconnected',
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect Mailchimp integration',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    checkIntegration();
  }, []);

  return {
    integration,
    audiences,
    loading,
    startOAuthFlow,
    addLeadsToAudience,
    createCampaign,
    disconnectIntegration,
    refreshAudiences: fetchAudiences,
  };
};
