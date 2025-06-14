import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Save, Trash2, Mail, Edit } from 'lucide-react';
import type { EmailTemplate } from '@/types/lead';

interface EmailTemplateBuilderProps {
  templates: EmailTemplate[];
  onSaveTemplate: (template: EmailTemplate) => void;
}

export const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({
  templates,
  onSaveTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [availableVariables] = useState([
    'firstName', 'lastName', 'company', 'title', 'industry'
  ]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveTemplate = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save templates.',
        variant: 'destructive'
      });
      return;
    }

    if (!templateName || !templateSubject || !templateContent) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const templateData = {
        name: templateName,
        subject: templateSubject,
        content: templateContent,
        variables: availableVariables,
        user_id: user.id
      };

      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert([templateData]);

        if (error) throw error;
      }

      // Create a complete EmailTemplate object for the callback
      const completeTemplate: EmailTemplate = {
        id: selectedTemplate?.id || crypto.randomUUID(),
        name: templateName,
        subject: templateSubject,
        content: templateContent,
        variables: availableVariables,
        createdAt: selectedTemplate?.createdAt || new Date(),
        updatedAt: new Date(),
        lastUsed: selectedTemplate?.lastUsed
      };

      onSaveTemplate(completeTemplate);
      
      toast({
        title: selectedTemplate ? 'Template updated' : 'Template created',
        description: 'Your email template has been saved successfully.'
      });

      // Reset form
      setSelectedTemplate(null);
      setIsEditing(false);
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error saving template',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!user || !selectedTemplate) {
      toast({
        title: 'Action prohibited',
        description: 'Please select a template and be signed in to delete.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', selectedTemplate.id)
        .eq('user_id', user.id);

      if (error) throw error;

      onSaveTemplate(selectedTemplate); // Notify parent to refresh templates
      
      toast({
        title: 'Template deleted',
        description: 'The email template has been deleted successfully.'
      });

      // Reset form
      setSelectedTemplate(null);
      setIsEditing(false);
      setTemplateName('');
      setTemplateSubject('');
      setTemplateContent('');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error deleting template',
        description: 'Failed to delete template. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Email Templates</h1>
        <p className="text-muted-foreground">Create and manage your email templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="apple-card lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Templates</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditing(true);
                  setTemplateName('');
                  setTemplateSubject('');
                  setTemplateContent('');
                }}
                className="h-8 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setSelectedTemplate(template);
                  setTemplateName(template.name);
                  setTemplateSubject(template.subject);
                  setTemplateContent(template.content);
                  setIsEditing(false);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {template.subject}
                </p>
                {template.lastUsed && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Last used {template.lastUsed.toLocaleDateString()}
                  </Badge>
                )}
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No templates yet. Create your first template!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="apple-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {isEditing 
                    ? (selectedTemplate ? 'Edit Template' : 'New Template')
                    : 'Template Preview'
                  }
                </CardTitle>
                <CardDescription>
                  {isEditing 
                    ? 'Create or modify your email template'
                    : 'Preview your selected template'
                  }
                </CardDescription>
              </div>
              {selectedTemplate && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 px-3"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  {isEditing && (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSaveTemplate}
                        className="h-8 px-3"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteTemplate}
                        className="h-8 px-3"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="apple-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <Input
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="apple-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Content</label>
                  <Textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Enter your email content..."
                    rows={8}
                    className="apple-input resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Available Variables</label>
                  <div className="flex flex-wrap gap-2">
                    {availableVariables.map((variable) => (
                      <Badge key={variable} variant="outline" className="cursor-pointer hover:bg-muted">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                {!selectedTemplate && (
                  <Button onClick={handleSaveTemplate} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </>
            ) : selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Subject</h3>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Content</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {selectedTemplate.content}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a template from the list or create a new one
                </p>
                <Button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsEditing(true);
                    setTemplateName('');
                    setTemplateSubject('');
                    setTemplateContent('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
