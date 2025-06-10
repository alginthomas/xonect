
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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

  const handleSave = () => {
    if (!name || !subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const usedVariables = availableVariables.filter(v => 
      subject.includes(v) || content.includes(v)
    );

    const template: EmailTemplate = {
      id: `template_${Date.now()}`,
      name,
      subject,
      content,
      variables: usedVariables,
      createdAt: new Date(),
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
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Template
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
                  <div>
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
                  <Button variant="outline" size="sm">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
