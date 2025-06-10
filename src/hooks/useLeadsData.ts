
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead } from '@/types/lead';

export const useLeadsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async (): Promise<Lead[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          first_name,
          last_name,
          email,
          personal_email,
          company,
          title,
          seniority,
          department,
          company_size,
          industry,
          location,
          phone,
          linkedin,
          twitter_url,
          facebook_url,
          photo_url,
          organization_website,
          organization_founded,
          tags,
          status,
          emails_sent,
          last_contact_date,
          created_at,
          completeness_score,
          category_id,
          remarks,
          user_id
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Transform data once in the query function
      return (data || []).map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        personalEmail: lead.personal_email || '',
        company: lead.company,
        title: lead.title,
        headline: '', // Default value since column doesn't exist
        seniority: lead.seniority,
        department: lead.department || '',
        keywords: '', // Default value since column doesn't exist
        companySize: lead.company_size,
        industry: lead.industry || '',
        location: lead.location || '',
        phone: lead.phone || '',
        linkedin: lead.linkedin || '',
        twitterUrl: lead.twitter_url || '',
        facebookUrl: lead.facebook_url || '',
        photoUrl: lead.photo_url || '',
        organizationWebsite: lead.organization_website || '',
        organizationLogo: '', // Default value since column doesn't exist
        organizationDomain: '', // Default value since column doesn't exist
        organizationFounded: lead.organization_founded || 0,
        organizationAddress: '', // Default value since column doesn't exist
        tags: lead.tags || [],
        status: lead.status,
        emailsSent: lead.emails_sent,
        lastContactDate: lead.last_contact_date ? new Date(lead.last_contact_date) : undefined,
        createdAt: new Date(lead.created_at),
        completenessScore: lead.completeness_score,
        categoryId: lead.category_id || '',
        remarks: lead.remarks || ''
      }));
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};
