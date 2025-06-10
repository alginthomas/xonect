
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/utils/security';

export const useTemplateOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: {
      name: string;
      subject: string;
      content: string;
      variables: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Sanitize template input
      const sanitizedTemplate = {
        name: sanitizeInput(template.name),
        subject: sanitizeInput(template.subject),
        content: sanitizeInput(template.content),
        variables: template.variables.map(v => sanitizeInput(v)),
        user_id: user.id,
      };

      const { error } = await supabase
        .from('email_templates')
        .insert(sanitizedTemplate);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: "Email template has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({
        title: "Error saving template",
        description: "Failed to save the email template",
        variant: "destructive",
      });
    },
  });

  return {
    saveTemplate: saveTemplateMutation.mutate,
    isSavingTemplate: saveTemplateMutation.isPending,
  };
};
