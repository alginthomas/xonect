
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Lead, EmailTemplate } from '@/types/lead';

interface EmailDialogProps {
  lead: Lead;
  templates: EmailTemplate[];
  onEmailSent: (leadId: string) => void;
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ lead, templates, onEmailSent }) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(replaceVariables(template.subject, lead));
      setContent(replaceVariables(template.content, lead));
    }
  };

  const replaceVariables = (text: string, leadData: Lead): string => {
    return text
      .replace(/{{first_name}}/g, leadData.firstName || '')
      .replace(/{{last_name}}/g, leadData.lastName || '')
      .replace(/{{company}}/g, leadData.company || '')
      .replace(/{{title}}/g, leadData.title || '')
      .replace(/{{organization_name}}/g, leadData.company || '')
      .replace(/{{industry}}/g, leadData.industry || '')
      .replace(/{{location}}/g, leadData.location || '');
  };

  const handleSendEmail = async () => {
    if (!subject || !content) {
      toast({
        title: "Missing fields",
        description: "Please fill in subject and content",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      // Here you would typically call your email sending API
      // For now, we'll simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email sent successfully",
        description: `Email sent to ${lead.firstName} ${lead.lastName}`,
      });
      
      onEmailSent(lead.id);
      setOpen(false);
      setSubject('');
      setContent('');
      setSelectedTemplate('');
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "There was an error sending the email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email to {lead.firstName} {lead.lastName}</DialogTitle>
          <DialogDescription>
            Compose and send a personalized email to this lead
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={`${lead.firstName} ${lead.lastName} <${lead.email}>`}
              disabled
              className="bg-muted"
            />
          </div>

          {templates.length > 0 && (
            <div>
              <Label htmlFor="template">Use Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compose your email message..."
              className="min-h-[200px]"
            />
          </div>

          <div className="bg-muted p-3 rounded text-sm">
            <strong>Lead Information:</strong>
            <ul className="mt-1 space-y-1">
              <li>Company: {lead.company}</li>
              <li>Title: {lead.title}</li>
              {lead.phone && <li>Phone: {lead.phone}</li>}
              {lead.linkedin && <li>LinkedIn: {lead.linkedin}</li>}
              {lead.location && <li>Location: {lead.location}</li>}
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
