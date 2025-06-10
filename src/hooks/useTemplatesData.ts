
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailTemplate } from '@/types/lead';

export const useTemplatesData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['email-templates', user?.id],
    queryFn: async (): Promise<EmailTemplate[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, content, variables, created_at, last_used')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
        variables: template.variables || [],
        createdAt: new Date(template.created_at),
        lastUsed: template.last_used ? new Date(template.last_used) : undefined
      }));
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};
