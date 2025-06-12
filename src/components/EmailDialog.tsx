import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Lead, EmailTemplate } from '@/types/lead';

interface BrandingData {
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  companyAddress: string;
  senderName: string;
  senderEmail: string;
}

interface EmailDialogProps {
  lead: Lead;
  templates: EmailTemplate[];
  branding: BrandingData;
  onEmailSent: (leadId: string) => void;
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ lead, templates, branding, onEmailSent }) => {
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

  const openDefaultEmailClient = () => {
    const emailSubject = encodeURIComponent(subject);
    const emailBody = encodeURIComponent(content);
    const mailtoUrl = `mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoUrl, '_self');
    setOpen(false);
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

    if (!branding.senderEmail || !branding.senderName) {
      toast({
        title: "Branding not configured",
        description: "Please configure your email branding settings first",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: lead.email,
          subject,
          content,
          leadName: `${lead.firstName} ${lead.lastName}`,
          senderName: branding.senderName,
          senderEmail: branding.senderEmail,
          companyName: branding.companyName,
          companyLogo: branding.companyLogo,
          companyWebsite: branding.companyWebsite,
          companyAddress: branding.companyAddress,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Email sent successfully",
        description: `Professional email sent to ${lead.firstName} ${lead.lastName}`,
      });
      
      onEmailSent(lead.id);
      setOpen(false);
      setSubject('');
      setContent('');
      setSelectedTemplate('');
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "There was an error sending the email",
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
          <DialogTitle>Send Professional Email to {lead.firstName} {lead.lastName}</DialogTitle>
          <DialogDescription>
            Compose and send a branded email using your company template
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

          <div>
            <Label htmlFor="sender">Sender</Label>
            <Input
              id="sender"
              value={`${branding.senderName} <${branding.senderEmail}>`}
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
            <strong>Branding Preview:</strong>
            <ul className="mt-1 space-y-1">
              <li>Company: {branding.companyName}</li>
              <li>Sender: {branding.senderName}</li>
              {branding.companyWebsite && <li>Website: {branding.companyWebsite}</li>}
              {branding.companyLogo && <li>Logo: Configured ✓</li>}
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={openDefaultEmailClient}>
              <Mail className="h-4 w-4 mr-2" />
              Open Email App
            </Button>
            <Button onClick={handleSendEmail} disabled={sending}>
              {sending ? 'Sending...' : 'Send Professional Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
