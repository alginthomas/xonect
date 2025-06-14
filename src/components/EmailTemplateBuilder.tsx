
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Save, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailTemplate } from '@/types/lead';

interface EmailTemplateBuilderProps {
  onSaveTemplate: (template: EmailTemplate) => void;
  templates: EmailTemplate[];
}

export const EmailTemplateBuilder: React.FC<EmailTemplateBuilderProps> = ({ 
  onSaveTemplate, 
  templates 
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const availableVariables = [
    '{{first_name}}',
    '{{last_name}}',
    '{{company}}',
    '{{title}}',
    '{{organization_name}}',
    '{{industry}}',
    '{{location}}'
  ];

  const insertVariable = (variable: string) => {
    setContent(prev => prev + variable);
  };

  const handleSave = async () => {
    if (!name || !subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save templates",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const usedVariables = availableVariables.filter(v => 
        subject.includes(v) || content.includes(v)
      );

      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          name,
          subject,
          content,
          variables: usedVariables,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        variables: data.variables || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        lastUsed: data.last_used ? new Date(data.last_used) : undefined
      };

      onSaveTemplate(template);
      
      toast({
        title: "Template saved",
        description: `Email template "${name}" has been saved successfully`,
      });

      // Reset form
      setName('');
      setSubject('');
      setContent('');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error saving template",
        description: "Failed to save the email template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully",
      });

      // Trigger a refresh by calling the parent's onSaveTemplate with null
      // This is a simple way to trigger a refresh without adding more props
      window.location.reload();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error deleting template",
        description: "Failed to delete the email template",
        variant: "destructive",
      });
    }
  };

  const previewContent = content
    .replace(/{{first_name}}/g, 'John')
    .replace(/{{last_name}}/g, 'Doe')
    .replace(/{{company}}/g, 'Acme Corporation')
    .replace(/{{title}}/g, 'Marketing Director')
    .replace(/{{organization_name}}/g, 'Acme Corporation')
    .replace(/{{industry}}/g, 'Technology')
    .replace(/{{location}}/g, 'San Francisco, CA');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Builder
          </CardTitle>
          <CardDescription>
            Create personalized email templates with dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cold Outreach - Tech Directors"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email-subject">Email Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Partnership opportunity with {{company}}"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Available Variables</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableVariables.map(variable => (
                <Badge 
                  key={variable}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => insertVariable(variable)}
                >
                  {variable}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="email-content">Email Content</Label>
            <Textarea
              id="email-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hi {{first_name}},&#10;&#10;I hope this email finds you well. I noticed you're working as a {{title}} at {{company}}..."
              className="mt-1 min-h-[200px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>

          {showPreview && content && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Subject:</strong> {subject.replace(/{{first_name}}/g, 'John').replace(/{{company}}/g, 'Acme Corporation')}
                  </div>
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded">
                    {previewContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                    <div className="flex gap-1 mt-1">
                      {template.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
