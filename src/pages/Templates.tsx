
import React, { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplateBuilder } from '@/components/EmailTemplateBuilder';
import { useTemplatesData } from '@/hooks/useTemplatesData';
import { useTemplateOperations } from '@/hooks/useTemplateOperations';

const Templates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: templates = [] } = useTemplatesData();
  const { saveTemplate } = useTemplateOperations();

  const handleSaveTemplate = useCallback((template: {
    name: string;
    subject: string;
    content: string;
    variables: string[];
  }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save templates",
        variant: "destructive",
      });
      return;
    }

    saveTemplate(template);
  }, [user, saveTemplate, toast]);

  return (
    <div className="p-6">
      <EmailTemplateBuilder 
        onSaveTemplate={handleSaveTemplate}
        templates={templates}
      />
    </div>
  );
};

export default Templates;
